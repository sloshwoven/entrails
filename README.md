entrails
========

Entrails makes it possible to test the innards of JavaScript functions by transforming them
so that local variables are attached to return values.

Say you have this function:

```javascript
function makeThing(n) {
    var triple = function(x) {
        return x * 3;
    };

    return {value: triple(n) + 7};
}
```

You can test the return value:

```javascript
var thing = makeThing(2);
assert.equals(thing.value, 13);
```

But there's no way to test the internal `triple` function without modifying the code to expose it.
Entrails automates this modification. The `triple` function can then be tested like this:

```javascript
assert.equals(thing._entrails.triple(2), 6);
```
