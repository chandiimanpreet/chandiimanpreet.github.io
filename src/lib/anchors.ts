// In-page anchor ids shared by sections that link to each other (Skills, Experience -> Projects).
export { headingId } from '@/content/nav'

/** DOM id of a project row; Skills links here. */
export const projectAnchorId = (projectId: string): string => `project-${projectId}`

/** DOM id of a work system row; Experience links here. */
export const systemAnchorId = (systemId: string): string => `system-${systemId}`
