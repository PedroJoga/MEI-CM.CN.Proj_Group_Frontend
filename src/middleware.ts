import { type MiddlewareConfig, NextResponse, type NextRequest } from "next/server"


enum Action {
    REDIRECT,
    NEXT,
}

const REDIRECT_WHEN_NOT_AUTHENTICATED = "/login"
const REDIRECT_WHEN_AUTHENTICATED = "/dashboard"

const publicRoutes = [
    { path: '/login', whenAuthenticated: Action.REDIRECT }, // public route but redirect if authenticated
    { path: '/register', whenAuthenticated: Action.REDIRECT }, 
    { path: '/', whenAuthenticated: Action.NEXT }, // public route and do nothing if authenticated
    { path: '/chat', whenAuthenticated: Action.NEXT },
] as const

export function middleware(request: NextRequest) {

    const path = request.nextUrl.pathname
    const publicRoute = publicRoutes.find(route => route.path === path)
    const authToken = request.cookies.get('echochat.token')

    if (!authToken && publicRoute) {
        // if the route is public and the user is not authenticated, allow access
        return NextResponse.next()
    }

    if (!authToken && !publicRoute) {
        // if the route is private and the user is not authenticated, redirect to login
        const redirectUrl = request.nextUrl.clone()

        redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED

        return NextResponse.redirect(redirectUrl)
    }

    if (authToken && publicRoute && publicRoute.whenAuthenticated === Action.REDIRECT) {
        // if the route is public and the user is authenticated, redirect to dashboard
        const redirectUrl = request.nextUrl.clone()

        redirectUrl.pathname = REDIRECT_WHEN_AUTHENTICATED

        return NextResponse.redirect(redirectUrl)
    }

    if (authToken && !publicRoute) {
        // if the route is private and the user is authenticated, check JWT validity
        // check JWT validity
        // TODO

        return NextResponse.next()
    }

    return NextResponse.next()

}

export const config: MiddlewareConfig = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
      ],
}