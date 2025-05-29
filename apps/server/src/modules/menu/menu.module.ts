import { Module, Provider } from '@nestjs/common'

import { MenuController } from './menu.controller'
import { MenuService } from './menu.service'
import { MenuAbility } from './menu.ability'

const providers: Provider[] = [
  MenuService,
  MenuAbility
]

@Module({
  controllers: [MenuController],
  providers,
  exports: [...providers],
})
export class MenuModule {}