class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = [
      'page',
      'sort',
      'limit',
      'fields',
    ];

    excludeFields.forEach(
      (el) => delete queryObj[el]
    );

    console.log(this.queryString, queryObj);

    //1B advance filtering
    let querystr = JSON.stringify(queryObj);
    querystr = querystr.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    );
    console.log(JSON.parse(querystr));
    this.query.find(JSON.parse(querystr));
    return this;
  }
  limit() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields
        .split(',')
        .join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-_v');
    }
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortby = this.queryString.sort
        .split(',')
        .join(' ');
      this.query = this.query.sort(sortby);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit =
      this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query
      .skip(skip)
      .limit(limit);
    return this;
  }
}
export default APIfeatures;
