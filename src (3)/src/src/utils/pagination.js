// src/utils/pagination.js

export function getPaginationParams(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit) || 20), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }
  
  export function getPaginationMeta(totalCount, page, limit) {
    return {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      limit,
      hasNextPage: page * limit < totalCount,
      hasPrevPage: page > 1
    };
  }