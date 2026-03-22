export interface ReqQuery {
    project?: string
    sort?: number
    limit?: string
    filter?: string
}

const defaultLimit = 10
const defaultSort = 'asc'
const defaultProject = 'id'
const defaultFilter = {}

export function prepareQuery(query: ReqQuery) {
  // Permet le requêtage de plusieurs colonnes (ex = /users?project=firstname,lastname)
  let project: Record<string, number>

  // Si project=all, on sélectionne tous les champs
  if (query.project === 'all') {
    project = {}
  } else if (query.project) {
    project = query.project.split(',').reduce(
      (acc, field) => {
        acc[field.trim()] = 1
        return acc
      },
      {} as Record<string, number>,
    )
  } else {
    project = { [defaultProject]: 1 }
  }

  const limit = query.limit ? Number(query.limit) : defaultLimit
    const filter = query.filter ? JSON.parse(query.filter) : defaultFilter
  let sort = defaultSort
  if (query.sort && query.sort === -1) sort = 'desc'

    return {project, sort, limit, filter}
}
