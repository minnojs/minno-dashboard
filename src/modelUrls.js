const urlPrefix = location.pathname.match(/^(?=\/)(.+?\/|$)/)[1]; // first pathname section with slashes

export const baseUrl            = `${urlPrefix}dashboard`;
export const studyUrl           = `${urlPrefix}dashboard/studies`;
export const tagsUrl            = `${urlPrefix}dashboard/tags`;
export const poolUrl            = `${urlPrefix}StudyData`;
export const fileUrl            = `${urlPrefix}dashboard`;
export const statisticsUrl      = `${urlPrefix}PITracking`;
export const downloadsUrl       = `${urlPrefix}DashboardData`;
export const activationUrl      = `${urlPrefix}dashboard/activation`;
export const downloadsAccessUrl = `${urlPrefix}DownloadsAccess`;
