// const urlPrefix = location.pathname.match(/^(?=\/)(.+?\/|$)/)[1]; // first pathname section with slashes
const urlPrefix = '//localhost:3001'; // first pathname section with slashes

export const baseUrl            = `${urlPrefix}`;
export const studyUrl           = `${urlPrefix}/studies`;
export const templatesUrl       = `${urlPrefix}/templates`;
export const tagsUrl            = `${urlPrefix}/tags`;
export const translateUrl       = `${urlPrefix}/translate`;
export const poolUrl            = `${urlPrefix}StudyData`;
export const fileUrl            = `${urlPrefix}`;
export const statisticsUrl      = `${urlPrefix}PITracking`;
export const downloadsUrl       = `${urlPrefix}Data`;
export const activationUrl      = `${urlPrefix}/activation`;
export const collaborationUrl   = `${urlPrefix}/collaboration`;
export const downloadsAccessUrl = `${urlPrefix}DownloadsAccess`;