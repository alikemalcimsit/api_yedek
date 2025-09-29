export function getPaginationConfig(queryParams = {}) {
  const {
    page = 1,
    limit = 100,
    role,
    username,
    name,
    sortBy = 'id',
    sortOrder = 'desc'
  } = queryParams;

  return { page, limit, role, username, name, sortBy, sortOrder };
}