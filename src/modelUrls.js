/**/
const urlPrefix = window.location.origin; // first pathname section with slashes


export const baseUrl            = `${urlPrefix}`;
export const studyUrl           = `${urlPrefix}/studies`;
export const launchUrl          = `${urlPrefix}/launch`;
export const templatesUrl       = `${urlPrefix}/templates`;
export const tagsUrl            = `${urlPrefix}/tags`;
export const translateUrl       = `${urlPrefix}/translate`;
export const poolUrl            = `${urlPrefix}/StudyData`;
export const statisticsUrl      = `${urlPrefix}/PITracking`;
export const downloadsUrl       = `${urlPrefix}/DashboardData`;
export const activationUrl      = `${urlPrefix}/activation`;
export const collaborationUrl   = `${urlPrefix}/collaboration`;
export const downloadsAccessUrl = `${urlPrefix}/DownloadsAccess`;
/*


const urlPrefix = location.pathname.match(/^(?=\/)(.+?\/|$)/)[1]; // first pathname section with slashes

export const baseUrl            = `${urlPrefix}dashboard`;
export const studyUrl           = `${urlPrefix}dashboard/studies`;
export const templatesUrl       = `${urlPrefix}dashboard/templates`;
export const tagsUrl            = `${urlPrefix}dashboard/tags`;
export const translateUrl       = `${urlPrefix}dashboard/translate`;
export const poolUrl            = `${urlPrefix}StudyData`;
export const fileUrl            = `${urlPrefix}dashboard`;
export const statisticsUrl      = `${urlPrefix}PITracking`;
export const downloadsUrl       = `${urlPrefix}DashboardData`;
export const activationUrl      = `${urlPrefix}dashboard/activation`;
export const collaborationUrl   = `${urlPrefix}dashboard/collaboration`;
export const downloadsAccessUrl = `${urlPrefix}DownloadsAccess`;

/**/