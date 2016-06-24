const urlPrefix = location.pathname.match(/^(?=\/)(.+?\/|$)/)[1]; // first pathname section with slashes

export const studyUrl   = `${urlPrefix}dashboard/studies`;
export const poolUrl    = `${urlPrefix}StudyData`;
export const fileUrl    = `${urlPrefix}dashboard`;
export const statisticsUrl    = `${urlPrefix}PITracking`;
export const downloadsUrl    = `${urlPrefix}DashboardData`;
export const activationUrl    = `${urlPrefix}dashboard/activation`;
