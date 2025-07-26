type UserRole = "user" ;

export interface User {
    id: string
    username: string
    name: string
    avatarUrl: string
    email: string
    roles: UserRole[]
}

