# Enhanced Drupal JSON-API Params

enhanced-drupal-jsonapi-params
===========

[JSON:API](https://jsonapi.org/) is now part of [Drupal](https://www.drupal.org/) Core.

The JSON:API specifications defines standard query parameters to be used to do filtering, sorting, restricting fields that are returned, pagination and so on.

This module provides a helper Class to create and update query params for any Drupal jsonapi request. Please read the following for usage.

## Installation

Install the package via `npm`:

```sh
$ npm i enhanced-drupal-jsonapi-params
```

## Usage

### import

Import `DrupalJsonApiParams` from `drupal-jsonapi-params/lib`
Import `Operators` from `drupal-jsonapi-params/lib/operators`
Import `Conjunctions` from `drupal-jsonapi-params/lib/conjunctions`
```js
import {DrupalJsonApiParams} from 'drupal-jsonapi-params/lib'; // Helper class
import * as Operators from 'drupal-jsonapi-params/lib/operators'; // Allowed Drupal JSONAPI Operators
import * as Conjunctions from 'drupal-jsonapi-params/lib/conjunctions'; // Allowed Drupal JSONAPI Conjunctions

const apiParams = new DrupalJsonApiParams();
```

### require

```js
var drupalJsonapiParams = require("drupal-jsonapi-params")

const apiParams = new drupalJsonapiParams.DrupalJsonApiParams();
```

```js
apiParams
  // Add Group within Groups.
  .addGroup(
    'publish_status',
    Operators.or, // 'OR'
    'parent_group')
  .addGroup(
    'child_group_B',
    Operators.and, // 'AND'
    'parent_group')
  .addGroup('parent_group', Operators.and)
  // Add Filters.
  .addFilter('status', '1')
  // Add Filter to Group.
  .addFilter(
    'status', '2',
    Operators.notEqual, // '<>'
    'publish_status')
  // Add Pagination.
  .addPagination({
    limit: 5,
    offset: 0
  })
  // Add Fields.
  .addFields('node--article', ['field_a.id', 'field_b.uid', 'field_c.tid'])
  // Add Includes.
  .addInclude(['field_a.id', 'field_b.uid', 'field_c.tid'])
  // Add multiple sort criterion.
  .addSort('id', 'DESC')
  .addSort('uid')
  .addSort('status');
  // OR
  // Add multiple sort criterion at once ASC for id and uid, DESC for status
  .addSort('id,uid,-status')

const urlencodedQueryString = apiParams.getQueryString();

```

## API

### getQueryObject

Returns query in object form.

### mergeQueryObject

Adds query object to existing query object, also used for instantiating DrupalJsonApiParams with an existing query object.
```js

const queryObject = {
  filter: {
    id: UUID
  },
  include: 'some_relationship'
}

const apiParams = new DrupalJsonApiParams().mergeQueryObject(queryObject);

apiParams
.addGroup('parent_group', Operators.and)
.addFilter('status', 1, undefined, 'parent_group')

const newQueryObject = apiParams.getQueryObject();

// newQueryObject

{
  filter: {
    id: UUID,
    parent_group: {
      group: {
        conjunction: 'AND'
      }
    },
    status: {
      condition: {
        memberOf: "parent_group",
        operator: "=",
        path: "status",
        value: 1
      }
    }
  },
  include: 'some_relationship'
}

```

### getQueryString

Returns urlencoded query string which can be used in api calls.

### addFilter

Used to restrict items returned in a listing.

| Params | Type | Description |
| ---   | ---  | ---         |
| path     | `string` | A 'path' identifies a field on a resource
| value    | `string` | A 'value' is the thing you compare against
| operator | `string` | (Optional) An 'operator' is a method of comparison
| group    | `string` | (Optional) Name of the group, the filter belongs to


Following values can be used for the operator. If none is provided, it assumes "`=`" by default. All of these are available via the Operators object which is included in this package but not required for use.

```
  '=', '<>',
  '>', '>=', '<', '<=',
  'STARTS_WITH', 'CONTAINS', 'ENDS_WITH',
  'IN', 'NOT IN',
  'BETWEEN', 'NOT BETWEEN',
  'IS NULL', 'IS NOT NULL'
```

[Read more about filter in Drupal.org Documentation](https://www.drupal.org/docs/8/core/modules/jsonapi-module/filtering)

### addGroup

Used to group Filters. Groups can be nested too.

|Params | Type | Description |
| ---   | ---  | ---         |
| name        | `string` | Name of the group
| conjunction | `string` | (Optional) All groups have conjunctions and a conjunction is either `AND` or `OR`.
| memberOf    | `string` | (Optional) Name of the group, this group belongs to

All conjunctions are available via the Conjunctions object which is included in this package but not required.

### addInclude

Used to add referenced resources inside same request. Thereby preventing additional api calls.

|Params | Type | Description |
| ---   | ---  | ---         |
| fields | `string[]` | Array of field names

[Read more about Includes in Drupal.org Documentation](https://www.drupal.org/docs/8/modules/jsonapi/includes)

### addSort

Used to return the list of items in specific order.

|Params | Type | Description |
| ---   | ---  | ---         |
| path      | `string` | A 'path' identifies a field on a resource
| direction | `string` | Sort direction `ASC` or `DESC`

[Read more about Sort in Drupal.org Documentation](https://www.drupal.org/docs/8/modules/jsonapi/sorting)

### addPagination

Use to restrict max amount of items returned in the listing. Using this for pagination is tricky, and make sure you read the following document on Drupal.org to implement it correctly.

|Params | Type | Description |
| ---   | ---  | ---         |
| limit | `number` | Number of items to page by |
| offset | `number` | Desired page |

[Read more about Pagination in Drupal.org Documentation](https://www.drupal.org/docs/8/core/modules/jsonapi-module/pagination)

### addFields

The name of this method might be miss leading. Use this to explicitly request for specific fields on an entity.

|Params | Type | Description |
| ---   | ---  | ---         |
| type   | `string`   | Resource type
| fields | ``string[]`` | Array of field names in the given resource type
