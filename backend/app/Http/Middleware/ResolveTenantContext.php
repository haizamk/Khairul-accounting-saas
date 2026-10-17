<?php

namespace App\Http\Middleware;

use App\Models\CompanyUser;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenantContext
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated access.'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Platform master admins have separate guard and do not require company context
        if ($user->tokenCan('role:platform_admin')) {
            return $next($request);
        }

        // Tenant selection via X-Company-ID header or current association
        $requestedCompanyId = $request->header('X-Company-ID');

        $query = CompanyUser::with(['company', 'role'])
            ->where('user_id', $user->id)
            ->where('status', 'active');

        if ($requestedCompanyId) {
            $query->where('company_id', $requestedCompanyId);
        }

        $membership = $query->first();

        if (!$membership || !$membership->company || $membership->company->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized tenant context or company suspended.'
            ], Response::HTTP_FORBIDDEN);
        }

        // Bind active tenant context to application container
        app()->instance('CurrentTenant', $membership->company);
        app()->instance('CurrentRole', $membership->role);
        app()->instance('CurrentMembership', $membership);

        return $next($request);
    }
}
