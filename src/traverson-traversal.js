'use strict';

Polymer({
  is: 'traverson-traversal',
  hostAttributes: {
    hidden: true
  },
  properties: {
    traverson: {
      type: Object,
      notify: true,
      readonly: true,
      value: traverson
    },
    from: {
      type: String
    },
    follow: {
      type: Array,
      value: null
    },
    templateParameters: {
      type: Object,
      value: null
    },
    requestOptions: {
      type: Object,
      value: null
    },
    handleAs: {
      type: String,
      value: 'json'
    },
    method: {
      type: String,
      value: 'GET'
    },
    body: {
      type: Object,
      value: null
    },
    auto: {
      type: Boolean,
      value: false,
    },
    lastRequest: {
      type: Object,
      notify: true,
      readOnly: true
    },
    lastTraversal: {
      type: Object,
      notify: true,
      readOnly: true
    },
    loading: {
      type: Boolean,
      notify: true,
      readOnly: true
    },
    lastResponse: {
      type: Object,
      notify: true,
      readOnly: true
    },
    lastError: {
      type: Object,
      notify: true,
      readOnly: true
    },
    activeTraversals: {
      type: Array,
      notify: true,
      readOnly: true,
      value: function() {
        return [];
      }
    },
    debounceDuration: {
      type: Number,
      value: 0,
      notify: true
    },
    bubbles: {
      type: Boolean,
      value: false
    },
    _boundHandleResponse: {
      type: Function,
      value: function() {
        return this._handleResponse.bind(this);
      }
    }
  },
  observers: [
    '_traversalOptionsChanged(from, follow.*, templateParameters.*, requestOptions, body, handleAs, method, auto)'
  ],
  generateTraversal: function() {
    var request = this.traverson.from(this.from);

    switch (this.handleAs) {
      case 'json':
        request = request.json();
        break;
      case 'jsonHal':
        request = request.jsonHal();
        break;
      default:
        request = request.setMediaType(this.handleAs);
    }

    if (this.requestOptions) {
      request = request.withRequestOptions(this.requestOptions);
    }

    if (this.follow) {
      request = request.follow(this.follow);
    }

    if (this.templateParameters) {
      request = request.withTemplateParameters(this.templateParameters);
    }

    var traversal;
    switch (this.method) {
      case 'GET':
        traversal = request.getResource(this._boundHandleResponse.bind(this, request));
        break;
      case 'PUT':
        traversal = request.put(this.body, this._boundHandleResponse.bind(this, request));
        break;
      case 'PATCH':
        traversal = request.patch(this.body, this._boundHandleResponse.bind(this, request));
        break;
      case 'POST':
        traversal = request.post(this.body, this._boundHandleResponse.bind(this, request));
        break;
      case 'DELETE':
        traversal = request.delete(this._boundHandleResponse.bind(this, request));
        break;
    }

    this.push('activeTraversals', traversal);
    this._setLastTraversal(traversal);
    this._setLastRequest(request);
    this._setLoading(true);

    this.fire('traversal', { request: request, traversal: traversal }, { bubbles: this.bubbles });

    return traversal;
  },

  _handleError: function(request, error, response, traversal) {
    if (request === this.lastRequest) {
      this._setLastError({
        request: request,
        traversal: traversal,
        error: error,
        response: response
      });
      this._setLastTraversal(traversal);
      this._setLastResponse(null);
      this._setLoading(false);
    }
  },

  _handleResponse: function(request, error, response, traversal) {
    if (error) {
      this._handleError(traversal, error, response, traversal);
      return;
    }
    if (request === this.lastRequest) {
      this._setLastTraversal(traversal);
      this._setLastResponse(response);
      this._setLastError(null);
      this._setLoading(false);
    }
    this.fire('response', { request: request, traversal: traversal, response: response }, { bubbles: this.bubbles });
  },

  _discardTraversal: function(traversal) {
    var traversalIndex = this.activeTraversals.indexOf(traversal);

    if (traversalIndex > -1) {
      this.splice('activeTraversals', traversalIndex, 1);
    }
  },

  _traversalOptionsChanged: function() {
    this.debounce('generate-traversal', function() {
      if (this.from === null) {
        return;
      }
      if (this.auto) {
        this.generateTraversal();
      }
    }, this.debounceDuration);
  }
});
