class paginationSearchHandler {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search(searchField) {
    const searchTblQuery = {};
    searchTblQuery[searchField] = {
      $regex: this.queryStr.searchKey,
      $options: 'i' //case insentative
    };
    const keyword = this.queryStr.searchKey ? searchTblQuery : {};
    // console.log(keyword);
    this.query = this.query.find({ ...keyword });
    return this;
  }

  pagination() {
    const currentPerPage = Number(this.queryStr.pageNo);
    const resultperPage = Number(this.queryStr.pageSize);
    const skip = resultperPage * (currentPerPage - 1);
    this.query = this.query.limit(resultperPage).skip(skip);
    return this;
  }
}

export default paginationSearchHandler;
