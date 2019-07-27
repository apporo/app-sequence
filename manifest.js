module.exports = {
  "config": {
    "validation": {
      "schema": {
        "type": "object",
        "properties": {
          "breakOnError": {
            "type": "boolean"
          },
          "counterStateKey": {
            "type": "string"
          },
          "timeout": {
            "type": "number"
          }
        },
        "additionalProperties": false
      }
    }
  }
};
