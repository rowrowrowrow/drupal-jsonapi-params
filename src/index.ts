import qs = require('qs');

interface FilterItems {
  [key: string]: FilterItem | string | string[];
}

interface FilterItem {
  condition?: {
    operator?: string;
    memberOf?: string;
    path: string;
    value: string | string[];
  };
  group?: GroupItem;
}

interface GroupItems {
  [key: string]: GroupItem;
}

interface GroupItem {
  conjunction: string;
  memberOf?: string;
}

interface PageItem {
  limit?: number;
  offset?: number;
}

interface FieldItems {
  [key: string]: string;
}

interface Params {
  filter?: FilterItems | undefined;
  sort?: string[] | string;
  include?: string[] | string;
  page?: PageItem | undefined;
  fields?: FieldItems | undefined;
}

export class DrupalJsonApiParams {
  private filter: FilterItems = {};
  private sort: string[] = [];
  private include: string[] = [];
  private page: PageItem | undefined = undefined;
  private fields: FieldItems = {};

  public addFields(type: string, fields: string[]): DrupalJsonApiParams {
    this.fields[type] = fields.join(',');
    return this;
  }

  public addSort(path: string, direction?: string): DrupalJsonApiParams {
    let prefix = '';
    if (direction !== undefined && direction === 'DESC') {
      prefix = '-';
    }
    this.sort = this.sort.concat([prefix + path]);
    return this;
  }

  public addPagination(pagination: PageItem): DrupalJsonApiParams {
    this.page = { ...pagination };
    return this;
  }

  public addInclude(fields: string[]): DrupalJsonApiParams {
    this.include = this.include.concat(fields);
    return this;
  }

  public addGroup(name: string, conjunction: string = 'OR', memberOf?: string): DrupalJsonApiParams {
    this.filter[name] = {
      group: {
        conjunction,
        ...(memberOf !== undefined && { memberOf }),
      },
    };
    return this;
  }

  public addFilter(path: string, value: string | string[], operator: string = '=', memberOf?: string): DrupalJsonApiParams {
    if (operator === '=' && memberOf === undefined && this.filter[path] === undefined) {
      this.filter[path] = value;
      return this;
    }

    const name = this.getIndexId(this.filter, path);

    this.filter[name] = {
      condition: {
        path,
        value,
        ...(operator !== '=' && { operator }),
        ...(memberOf !== undefined && { memberOf }),
      },
    };

    return this;
  }

  private getIndexId(obj: any, proposedKey: string): string {
    let key: string;
    if (obj[proposedKey] === undefined) {
      key = proposedKey;
    } else {
      key = Object.keys(obj).length.toString();
    }
    return key;
  }

  public mergeQueryObject(params: Params): DrupalJsonApiParams {
    this.filter = { ...this.filter, ...params.filter};
    if (params.sort !== undefined && !!params.sort.length) {
      let a = params.sort;
      if (typeof a === 'string') {
        a = a.split(',');
      }
      this.sort = this.sort.concat(a);
    }
    if (params.include !== undefined && !!params.include.length) {
      let a = params.include;
      if (typeof a === 'string') {
        a = a.split(',');
      }
      this.include = this.include.concat(a);
    }
    this.page = params.page !== undefined && params.page.limit !== undefined ? { ...params.page} : this.page;
    this.fields = { ...params.fields};
    return this;
  }

  public getQueryObject(): object {
    const data = {
      ...(this.filter !== {} && { filter: this.filter }),
      ...(!!this.include.length && { include: this.include.join(',') }),
      ...(this.page !== undefined && { page: this.page }),
      ...(!!this.sort.length && { sort: this.sort.join(',') }),
      ...(this.fields !== {} && { fields: this.fields }),
    };
    return data;
  }

  public getQueryString(): string {
    const data = this.getQueryObject();
    return qs.stringify(data);
  }
}
