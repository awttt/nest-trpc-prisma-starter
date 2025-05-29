import { Injectable } from '@nestjs/common'
import { AbilityBuilder, PureAbility } from '@casl/ability'
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma'

import { Action, PrismaSubjects } from '../casl/ability.class'
import { Menu } from 'database/client'

type AppAbility = PureAbility<
  [string, Subjects<PrismaSubjects>],
  PrismaQuery
>

@Injectable()
export class MenuAbility {
  createForUser(user: IAuthUser) {
    const { can, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    )

    if (user.role === 'Admin') {
      can(Action.Manage, 'Menu')
    } else {
      can(Action.Read, 'Menu')
    }

    return build()
  }
}