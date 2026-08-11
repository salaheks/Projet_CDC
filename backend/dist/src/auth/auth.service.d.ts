import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly SALT_ROUNDS;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.GlobalRole;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.GlobalRole;
        };
    }>;
    refreshToken(userId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    validateUser(payload: JwtPayload): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.GlobalRole;
    }>;
    private generateTokens;
}
export {};
