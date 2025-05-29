import { PureAbility } from '@casl/ability'
import { Subjects } from '@casl/prisma'
import { Todo, User,Menu } from 'database'

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

// eslint-disable-next-line ts/consistent-type-definitions
export type PrismaSubjects = {
  User: User
  Todo: Todo
  Menu: Menu
}

export type AppAbility = PureAbility<[Action, Subjects<PrismaSubjects>]>

export abstract class BaseAbility {
  abstract createForUser(user: IAuthUser): AppAbility
}
