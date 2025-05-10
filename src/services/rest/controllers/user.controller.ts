import { Context } from 'deps'
import getCloudFrontSignedUrl from 'utils/aws/cloudFront/getCloudFrontSignedUrl'

import { successObject } from 'utils/responseObject'

export const userSetting = async (ctx: Context) => {
	const user = ctx.state.shared.user
	const { email } = user

	const profilePictureUrl = getCloudFrontSignedUrl(email)

	ctx.body = successObject('', { ...user, profilePictureUrl })
}
