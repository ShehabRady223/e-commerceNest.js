import { Query } from 'mongoose';

export class ApiFeatures<T> {
    private mongooseQuery: Query<T[], T>;
    private queryString: Record<string, any>;
    constructor(mongooseQuery: Query<T[], T>, queryString: Record<string, any>) {
        this.mongooseQuery = mongooseQuery;
        this.queryString = queryString;
    }
    // ── 1. FILTER ──────────────────────────────────────────────────
    filter(): this {
        const excludedFields = ['page', 'limit', 'sortBy', 'sortOrder', 'keyword'];
        const queryObj = { ...this.queryString };
        excludedFields.forEach((f) => delete queryObj[f]);
        // Support operators: price[gte]=100  →  { price: { $gte: 100 } }
        // const queryStr = JSON.stringify(queryObj).replace(/\[(gte|gt|lte|lt)\]/g, '":{"$1"');
        const queryStr = JSON.stringify(queryObj).replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`,
        );
        this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
        // console.log(JSON.parse(queryStr));
        return this;
    }
    // ── 2. SEARCH ──────────────────────────────────────────────────
    search(fields: string[]): this {
        const { keyword } = this.queryString;
        if (keyword) {
            const regex = new RegExp(keyword, 'i');
            this.mongooseQuery = this.mongooseQuery.find({
                $or: fields.map((f) => ({ [f]: regex })),
            });
        }
        return this;
    }
    // ── 3. SORT ────────────────────────────────────────────────────
    sort(): this {
        const sortBy = this.queryString.sortBy ?? 'createdAt';
        const sortOrder = this.queryString.sortOrder === 'asc' ? 1 : -1;
        this.mongooseQuery = this.mongooseQuery.sort({ [sortBy]: sortOrder });
        return this;
    }
    // ── 4. PAGINATE ────────────────────────────────────────────────
    paginate(): this {
        const page = Math.max(1, parseInt(this.queryString.page) || 1);
        const limit = Math.min(100, parseInt(this.queryString.limit) || 10);
        const skip = (page - 1) * limit;
        this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
        return this;
    }
    build(): Query<T[], T> {
        return this.mongooseQuery;
    }
}