import { Context } from 'deps'

import { successObject } from 'utils/responseObject'

export const userSetting = async (ctx: Context) => {
	const user = ctx.state.shared.user

	ctx.body = successObject('', user)
}
