# loopback-filter-by-reations-mixin


## Features

- filter items by properties in related models 
- supports 'hasMany', 'hasManyThrough', 'belongsTo' relations
- works with nested relations
- use as mixin

## Installation

```bash
npm install loopback-filter-by-reations-mixin --save
```

## How to use

Add the mixins property to your server/model-config.json like the following:

```json
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "../common/mixins",
      "../node_modules/loopback-filter-by-reations-mixin"
    ]
  }
}
```


To use with your Models add the mixins attribute to the definition object of your model config.

```json

{
  "name": "Customer",
  "mixins": {
    "FilterByRelations": true
  },
  "relations": {
    "orders": {
      "type": "hasMany",
      "model": "Order",
      "foreignKey": "customerId"
    }
  },
  "properties": {
    "id": "Number",
    "name": "String",
    "age": "Number"
  }
} 
```
```json
{
  "name": "Order",
  "mixins": {
    "FilterByRelations": true
  },
  "relations": {
    "customer": {
      "type": "belongsTo",
      "model": "Customer",
      "foreignKey": "customerId"
    }
  },
  "properties": {
    "id": "Number",
    "name": "String",
    "price": "Number",
    "customerId": "Number"
  }
}
```

Then use in you queries like:

```json
  {
    "where": {
      "<RelationName>": "<WhereCondition>"
    }
  }
```

```js
Customer.find({
  where: {
    orders: {
      price: { gt: 1000 }
    }
  }
}
```

```js
Order.find({
  where: {
    customer: {
      age: { gte: 18 }
    }
  }
});
```



## License

[MIT](LICENSE)