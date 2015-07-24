# Config

You must configure a mapping `type → structure`

```yaml
neo4j:
  host: localhost
  port: 7474
types:
  thing: node
  relation: arc
  equiv: equivalence
```
(in `config.yaml`, `config.json` or `--config [filename.json|filename.yaml]`)

# Input

Input data elements are of this form

```js
{
  dataset: /* string */,
  type: /* what you defined in config */,
  operation: /* 'add' or 'remove' */

  // all optional, depends on the structure
  id: '123',
  s: '123',
  t: '123',

  // whatever you want
  data: { /*...*/ }
}
```

# API

One function, input: stream, output: stream.

Example code

```js
var H = require('highland');
var graphmalizer = require('graphmalizer-core');

var stream = H([ {type: 'thing', id: 'x'} ]);

graphmalizer(stream)
  .each(H.log);
```

# Examples

See [`examples/`](examples/)

