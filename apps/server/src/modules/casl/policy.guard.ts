import { subject } from '@casl/ability'
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { getRequestItemId } from '@server/helper/get-request-item-id.helper'
import { ExtendedPrismaClient, InjectPrismaClient } from '@server/shared/database/prisma.extension'

import { FastifyRequest } from 'fastify'

import { BizException } from 'src/common/exceptions/biz.exception'

import { ErrorCodeEnum } from 'src/constants/error-code.constant'

import { AbilityService } from './casl.service'
import { CHECK_POLICY_KEY, PolicyObject } from './policy.decortor'

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityService: AbilityService,
    @InjectPrismaClient()
    private readonly prisma: ExtendedPrismaClient,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>()

    const { user } = context.switchToHttp().getRequest()

    if (!user)
      throw new UnauthorizedException()

    const policy = this.reflector.getAllAndOverride<PolicyObject>(CHECK_POLICY_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    // 使用了 PolicyGuard 但没未其定义 policy 则不允许通过
    if (!policy)
      throw new BizException(ErrorCodeEnum.NoPermission)

    const { action, model } = policy

    const abilityFactory = this.abilityService.abilityMap[model]

    if (!abilityFactory) {
      // 如果没有找到对应的 Ability 工厂，可以选择放行或拒绝
      return true; // 临时放行所有请求
    }

    const ability = abilityFactory.createForUser(user)

    // 获取请求资源的的 id
    const id = getRequestItemId(request)

    // 如果 id 存在，则检查具体资源
    if (id) {
      const item = await this.prisma[model].findUniqueOrThrow({
        where: { id },
      })

      return ability.can(action, subject(model, item))
    }

    return ability.can(action, model)
  }
}
