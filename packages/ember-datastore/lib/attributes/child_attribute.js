// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2010 Evin Grano
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('ember-datastore/system/record');
require('ember-datastore/attributes/record_attribute');

var get = SC.get, set = SC.set;

/** @class

  ChildAttribute is a subclass of `RecordAttribute` and handles to-one
  relationships for child records.

  When setting ( `set()` ) the value of a toMany attribute, make sure
  to pass in an array of `SC.Record` objects.

  There are many ways you can configure a ManyAttribute:

      contacts: SC.ChildAttribute.attr('SC.Child');

  @extends SC.RecordAttribute
  @since SproutCore 1.0
*/
SC.ChildAttribute = SC.RecordAttribute.extend(
  /** @scope SC.ChildAttribute.prototype */ {

  isNestedRecordTransform: YES,

  // ..........................................................
  // LOW-LEVEL METHODS
  //

  /**  @private - adapted for to one relationship */
  toType: function(record, key, value) {
    var ret   = null, rel,
        recordType  = get(this, 'typeClass');

    if (!record) {
      throw 'SC.Child: Error during transform: Unable to retrieve parent record.';
    }
    if (!SC.none(value)) ret = record.registerNestedRecord(value, key);

    return ret;
  },

  // Default fromType is just returning itself
  fromType: function(record, key, value) {
    var sk, store, ret;

    if (record) {
      if (SC.none(value)) {
        // Handle null value.
        record.writeAttribute(key, value);
        ret = value;
      } else {
        // Register the nested record with this record (the parent).
        ret = record.registerNestedRecord(value, key);

        if (ret) {
          // Write the data hash of the nested record to the store.
          sk = get(ret, 'storeKey');
          store = get(ret, 'store');
          record.writeAttribute(key, store.readDataHash(sk));
        } else if (value) {
          // If registration failed, just write the value.
          record.writeAttribute(key, value);
        }
      }
    }

    return ret;
  },

  /**
    The core handler.  Called from the property.
    @param {SC.Record} record the record instance
    @param {String} key the key used to access this attribute on the record
    @param {Object} value the property value if called as a setter
    @returns {Object} property value
  */
  call: function(record, key, value) {
    var attrKey = get(this, 'key') || key, cRef,
        cacheKey = '__kid__'+SC.guidFor(this);
    if (value !== undefined) {
      // this.orphan(record, cacheKey, value);
      value = this.fromType(record, key, value) ; // convert to attribute.
      // record[cacheKey] = value;
    } else {
      value = record.readAttribute(attrKey);
      if (SC.none(value) && (value = get(this, 'defaultValue'))) {
        if (typeof value === 'function') {
          value = this.defaultValue(record, key, this);
          // write default value so it doesn't have to be executed again
          if(get(record, 'attributes')) record.writeAttribute(attrKey, value, true);
        }
      } else value = this.toType(record, key, value);
    }

    return value ;
  }
});


