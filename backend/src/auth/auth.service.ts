import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async syncUser(auth0User: any) {
    return this.prisma.user.upsert({
      where: { auth0Id: auth0User.sub },
      update: {
        email: auth0User.email,
        name: auth0User.name,
      },
      create: {
        auth0Id: auth0User.sub,
        email: auth0User.email,
        name: auth0User.name,
      },
    });
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        assets: true,
        orders: true,
      },
    });
  }

  async getUserByAuth0Id(auth0Id: string) {
    return this.prisma.user.findUnique({
      where: { auth0Id },
    });
  }
}
