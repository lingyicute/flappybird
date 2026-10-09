// Storage shim: the plain `localStorage` getter throws in sandboxed /
// opaque-origin documents (e.g. a sandbox="allow-scripts" iframe), so fall
// back to an in-memory map.
const __ls = (() => {
  try {
    const t = window.localStorage;
    t.getItem("__probe__");
    return t;
  } catch {
    const m = new Map();
    return {
      getItem: (k) => (m.has(k) ? m.get(k) : null),
      setItem: (k, v) => m.set(k, String(v)),
      removeItem: (k) => m.delete(k),
    };
  }
})();
var ra = { exports: {} },
  ui = {},
  ia = { exports: {} },
  Z = {};
var cf;
function Ev() {
  if (cf) return Z;
  cf = 1;
  var r = Symbol.for("react.element"),
    i = Symbol.for("react.portal"),
    l = Symbol.for("react.fragment"),
    u = Symbol.for("react.strict_mode"),
    c = Symbol.for("react.profiler"),
    f = Symbol.for("react.provider"),
    h = Symbol.for("react.context"),
    g = Symbol.for("react.forward_ref"),
    _ = Symbol.for("react.suspense"),
    w = Symbol.for("react.memo"),
    O = Symbol.for("react.lazy"),
    R = Symbol.iterator;
  function L(y) {
    return y === null || typeof y != "object"
      ? null
      : ((y = (R && y[R]) || y["@@iterator"]),
        typeof y == "function" ? y : null);
  }
  var z = {
      isMounted: function () {
        return !1;
      },
      enqueueForceUpdate: function () {},
      enqueueReplaceState: function () {},
      enqueueSetState: function () {},
    },
    Q = Object.assign,
    X = {};
  function b(y, A, K) {
    (this.props = y),
      (this.context = A),
      (this.refs = X),
      (this.updater = K || z);
  }
  (b.prototype.isReactComponent = {}),
    (b.prototype.setState = function (y, A) {
      if (typeof y != "object" && typeof y != "function" && y != null)
        throw Error(
          "setState(...): takes an object of state variables to update or a function which returns an object of state variables.",
        );
      this.updater.enqueueSetState(this, y, A, "setState");
    }),
    (b.prototype.forceUpdate = function (y) {
      this.updater.enqueueForceUpdate(this, y, "forceUpdate");
    });
  function ee() {}
  ee.prototype = b.prototype;
  function M(y, A, K) {
    (this.props = y),
      (this.context = A),
      (this.refs = X),
      (this.updater = K || z);
  }
  var J = (M.prototype = new ee());
  (J.constructor = M), Q(J, b.prototype), (J.isPureReactComponent = !0);
  var se = Array.isArray,
    Ae = Object.prototype.hasOwnProperty,
    ze = { current: null },
    Ye = { key: !0, ref: !0, __self: !0, __source: !0 };
  function at(y, A, K) {
    var q,
      ne = {},
      re = null,
      ce = null;
    if (A != null)
      for (q in (A.ref !== void 0 && (ce = A.ref),
      A.key !== void 0 && (re = "" + A.key),
      A))
        Ae.call(A, q) && !Ye.hasOwnProperty(q) && (ne[q] = A[q]);
    var le = arguments.length - 2;
    if (le === 1) ne.children = K;
    else if (1 < le) {
      for (var me = Array(le), tt = 0; tt < le; tt++)
        me[tt] = arguments[tt + 2];
      ne.children = me;
    }
    if (y && y.defaultProps)
      for (q in ((le = y.defaultProps), le))
        ne[q] === void 0 && (ne[q] = le[q]);
    return {
      $$typeof: r,
      type: y,
      key: re,
      ref: ce,
      props: ne,
      _owner: ze.current,
    };
  }
  function Kt(y, A) {
    return {
      $$typeof: r,
      type: y.type,
      key: A,
      ref: y.ref,
      props: y.props,
      _owner: y._owner,
    };
  }
  function Bt(y) {
    return typeof y == "object" && y !== null && y.$$typeof === r;
  }
  function _n(y) {
    var A = { "=": "=0", ":": "=2" };
    return (
      "$" +
      y.replace(/[=:]/g, function (K) {
        return A[K];
      })
    );
  }
  var At = /\/+/g;
  function et(y, A) {
    return typeof y == "object" && y !== null && y.key != null
      ? _n("" + y.key)
      : A.toString(36);
  }
  function gt(y, A, K, q, ne) {
    var re = typeof y;
    (re === "undefined" || re === "boolean") && (y = null);
    var ce = !1;
    if (y === null) ce = !0;
    else
      switch (re) {
        case "string":
        case "number":
          ce = !0;
          break;
        case "object":
          switch (y.$$typeof) {
            case r:
            case i:
              ce = !0;
          }
      }
    if (ce)
      return (
        (ce = y),
        (ne = ne(ce)),
        (y = q === "" ? "." + et(ce, 0) : q),
        se(ne)
          ? ((K = ""),
            y != null && (K = y.replace(At, "$&/") + "/"),
            gt(ne, A, K, "", function (tt) {
              return tt;
            }))
          : ne != null &&
            (Bt(ne) &&
              (ne = Kt(
                ne,
                K +
                  (!ne.key || (ce && ce.key === ne.key)
                    ? ""
                    : ("" + ne.key).replace(At, "$&/") + "/") +
                  y,
              )),
            A.push(ne)),
        1
      );
    if (((ce = 0), (q = q === "" ? "." : q + ":"), se(y)))
      for (var le = 0; le < y.length; le++) {
        re = y[le];
        var me = q + et(re, le);
        ce += gt(re, A, K, me, ne);
      }
    else if (((me = L(y)), typeof me == "function"))
      for (y = me.call(y), le = 0; !(re = y.next()).done; )
        (re = re.value), (me = q + et(re, le++)), (ce += gt(re, A, K, me, ne));
    else if (re === "object")
      throw (
        ((A = String(y)),
        Error(
          "Objects are not valid as a React child (found: " +
            (A === "[object Object]"
              ? "object with keys {" + Object.keys(y).join(", ") + "}"
              : A) +
            "). If you meant to render a collection of children, use an array instead.",
        ))
      );
    return ce;
  }
  function Tt(y, A, K) {
    if (y == null) return y;
    var q = [],
      ne = 0;
    return (
      gt(y, q, "", "", function (re) {
        return A.call(K, re, ne++);
      }),
      q
    );
  }
  function je(y) {
    if (y._status === -1) {
      var A = y._result;
      (A = A()),
        A.then(
          function (K) {
            (y._status === 0 || y._status === -1) &&
              ((y._status = 1), (y._result = K));
          },
          function (K) {
            (y._status === 0 || y._status === -1) &&
              ((y._status = 2), (y._result = K));
          },
        ),
        y._status === -1 && ((y._status = 0), (y._result = A));
    }
    if (y._status === 1) return y._result.default;
    throw y._result;
  }
  var _e = { current: null },
    D = { transition: null },
    j = {
      ReactCurrentDispatcher: _e,
      ReactCurrentBatchConfig: D,
      ReactCurrentOwner: ze,
    };
  function F() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return (
    (Z.Children = {
      map: Tt,
      forEach: function (y, A, K) {
        Tt(
          y,
          function () {
            A.apply(this, arguments);
          },
          K,
        );
      },
      count: function (y) {
        var A = 0;
        return (
          Tt(y, function () {
            A++;
          }),
          A
        );
      },
      toArray: function (y) {
        return (
          Tt(y, function (A) {
            return A;
          }) || []
        );
      },
      only: function (y) {
        if (!Bt(y))
          throw Error(
            "React.Children.only expected to receive a single React element child.",
          );
        return y;
      },
    }),
    (Z.Component = b),
    (Z.Fragment = l),
    (Z.Profiler = c),
    (Z.PureComponent = M),
    (Z.StrictMode = u),
    (Z.Suspense = _),
    (Z.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = j),
    (Z.act = F),
    (Z.cloneElement = function (y, A, K) {
      if (y == null)
        throw Error(
          "React.cloneElement(...): The argument must be a React element, but you passed " +
            y +
            ".",
        );
      var q = Q({}, y.props),
        ne = y.key,
        re = y.ref,
        ce = y._owner;
      if (A != null) {
        if (
          (A.ref !== void 0 && ((re = A.ref), (ce = ze.current)),
          A.key !== void 0 && (ne = "" + A.key),
          y.type && y.type.defaultProps)
        )
          var le = y.type.defaultProps;
        for (me in A)
          Ae.call(A, me) &&
            !Ye.hasOwnProperty(me) &&
            (q[me] = A[me] === void 0 && le !== void 0 ? le[me] : A[me]);
      }
      var me = arguments.length - 2;
      if (me === 1) q.children = K;
      else if (1 < me) {
        le = Array(me);
        for (var tt = 0; tt < me; tt++) le[tt] = arguments[tt + 2];
        q.children = le;
      }
      return {
        $$typeof: r,
        type: y.type,
        key: ne,
        ref: re,
        props: q,
        _owner: ce,
      };
    }),
    (Z.createContext = function (y) {
      return (
        (y = {
          $$typeof: h,
          _currentValue: y,
          _currentValue2: y,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
          _defaultValue: null,
          _globalName: null,
        }),
        (y.Provider = { $$typeof: f, _context: y }),
        (y.Consumer = y)
      );
    }),
    (Z.createElement = at),
    (Z.createFactory = function (y) {
      var A = at.bind(null, y);
      return (A.type = y), A;
    }),
    (Z.createRef = function () {
      return { current: null };
    }),
    (Z.forwardRef = function (y) {
      return { $$typeof: g, render: y };
    }),
    (Z.isValidElement = Bt),
    (Z.lazy = function (y) {
      return { $$typeof: O, _payload: { _status: -1, _result: y }, _init: je };
    }),
    (Z.memo = function (y, A) {
      return { $$typeof: w, type: y, compare: A === void 0 ? null : A };
    }),
    (Z.startTransition = function (y) {
      var A = D.transition;
      D.transition = {};
      try {
        y();
      } finally {
        D.transition = A;
      }
    }),
    (Z.unstable_act = F),
    (Z.useCallback = function (y, A) {
      return _e.current.useCallback(y, A);
    }),
    (Z.useContext = function (y) {
      return _e.current.useContext(y);
    }),
    (Z.useDebugValue = function () {}),
    (Z.useDeferredValue = function (y) {
      return _e.current.useDeferredValue(y);
    }),
    (Z.useEffect = function (y, A) {
      return _e.current.useEffect(y, A);
    }),
    (Z.useId = function () {
      return _e.current.useId();
    }),
    (Z.useImperativeHandle = function (y, A, K) {
      return _e.current.useImperativeHandle(y, A, K);
    }),
    (Z.useInsertionEffect = function (y, A) {
      return _e.current.useInsertionEffect(y, A);
    }),
    (Z.useLayoutEffect = function (y, A) {
      return _e.current.useLayoutEffect(y, A);
    }),
    (Z.useMemo = function (y, A) {
      return _e.current.useMemo(y, A);
    }),
    (Z.useReducer = function (y, A, K) {
      return _e.current.useReducer(y, A, K);
    }),
    (Z.useRef = function (y) {
      return _e.current.useRef(y);
    }),
    (Z.useState = function (y) {
      return _e.current.useState(y);
    }),
    (Z.useSyncExternalStore = function (y, A, K) {
      return _e.current.useSyncExternalStore(y, A, K);
    }),
    (Z.useTransition = function () {
      return _e.current.useTransition();
    }),
    (Z.version = "18.3.1"),
    Z
  );
}
var df;
function qa() {
  return df || ((df = 1), (ia.exports = Ev())), ia.exports;
}
var ff;
function wv() {
  if (ff) return ui;
  ff = 1;
  var r = qa(),
    i = Symbol.for("react.element"),
    l = Symbol.for("react.fragment"),
    u = Object.prototype.hasOwnProperty,
    c = r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
    f = { key: !0, ref: !0, __self: !0, __source: !0 };
  function h(g, _, w) {
    var O,
      R = {},
      L = null,
      z = null;
    w !== void 0 && (L = "" + w),
      _.key !== void 0 && (L = "" + _.key),
      _.ref !== void 0 && (z = _.ref);
    for (O in _) u.call(_, O) && !f.hasOwnProperty(O) && (R[O] = _[O]);
    if (g && g.defaultProps)
      for (O in ((_ = g.defaultProps), _)) R[O] === void 0 && (R[O] = _[O]);
    return {
      $$typeof: i,
      type: g,
      key: L,
      ref: z,
      props: R,
      _owner: c.current,
    };
  }
  return (ui.Fragment = l), (ui.jsx = h), (ui.jsxs = h), ui;
}
var hf;
function Cv() {
  return hf || ((hf = 1), (ra.exports = wv())), ra.exports;
}
var P = Cv(),
  fe = qa(),
  Gs = {},
  sa = { exports: {} },
  Ze = {},
  la = { exports: {} },
  oa = {};
var pf;
function kv() {
  return (
    pf ||
      ((pf = 1),
      (function (r) {
        function i(D, j) {
          var F = D.length;
          D.push(j);
          e: for (; 0 < F; ) {
            var y = (F - 1) >>> 1,
              A = D[y];
            if (0 < c(A, j)) (D[y] = j), (D[F] = A), (F = y);
            else break e;
          }
        }
        function l(D) {
          return D.length === 0 ? null : D[0];
        }
        function u(D) {
          if (D.length === 0) return null;
          var j = D[0],
            F = D.pop();
          if (F !== j) {
            D[0] = F;
            e: for (var y = 0, A = D.length, K = A >>> 1; y < K; ) {
              var q = 2 * (y + 1) - 1,
                ne = D[q],
                re = q + 1,
                ce = D[re];
              if (0 > c(ne, F))
                re < A && 0 > c(ce, ne)
                  ? ((D[y] = ce), (D[re] = F), (y = re))
                  : ((D[y] = ne), (D[q] = F), (y = q));
              else if (re < A && 0 > c(ce, F))
                (D[y] = ce), (D[re] = F), (y = re);
              else break e;
            }
          }
          return j;
        }
        function c(D, j) {
          var F = D.sortIndex - j.sortIndex;
          return F !== 0 ? F : D.id - j.id;
        }
        if (
          typeof performance == "object" &&
          typeof performance.now == "function"
        ) {
          var f = performance;
          r.unstable_now = function () {
            return f.now();
          };
        } else {
          var h = Date,
            g = h.now();
          r.unstable_now = function () {
            return h.now() - g;
          };
        }
        var _ = [],
          w = [],
          O = 1,
          R = null,
          L = 3,
          z = !1,
          Q = !1,
          X = !1,
          b = typeof setTimeout == "function" ? setTimeout : null,
          ee = typeof clearTimeout == "function" ? clearTimeout : null,
          M = typeof setImmediate < "u" ? setImmediate : null;
        typeof navigator < "u" &&
          navigator.scheduling !== void 0 &&
          navigator.scheduling.isInputPending !== void 0 &&
          navigator.scheduling.isInputPending.bind(navigator.scheduling);
        function J(D) {
          for (var j = l(w); j !== null; ) {
            if (j.callback === null) u(w);
            else if (j.startTime <= D)
              u(w), (j.sortIndex = j.expirationTime), i(_, j);
            else break;
            j = l(w);
          }
        }
        function se(D) {
          if (((X = !1), J(D), !Q))
            if (l(_) !== null) (Q = !0), je(Ae);
            else {
              var j = l(w);
              j !== null && _e(se, j.startTime - D);
            }
        }
        function Ae(D, j) {
          (Q = !1), X && ((X = !1), ee(at), (at = -1)), (z = !0);
          var F = L;
          try {
            for (
              J(j), R = l(_);
              R !== null && (!(R.expirationTime > j) || (D && !_n()));

            ) {
              var y = R.callback;
              if (typeof y == "function") {
                (R.callback = null), (L = R.priorityLevel);
                var A = y(R.expirationTime <= j);
                (j = r.unstable_now()),
                  typeof A == "function"
                    ? (R.callback = A)
                    : R === l(_) && u(_),
                  J(j);
              } else u(_);
              R = l(_);
            }
            if (R !== null) var K = !0;
            else {
              var q = l(w);
              q !== null && _e(se, q.startTime - j), (K = !1);
            }
            return K;
          } finally {
            (R = null), (L = F), (z = !1);
          }
        }
        var ze = !1,
          Ye = null,
          at = -1,
          Kt = 5,
          Bt = -1;
        function _n() {
          return !(r.unstable_now() - Bt < Kt);
        }
        function At() {
          if (Ye !== null) {
            var D = r.unstable_now();
            Bt = D;
            var j = !0;
            try {
              j = Ye(!0, D);
            } finally {
              j ? et() : ((ze = !1), (Ye = null));
            }
          } else ze = !1;
        }
        var et;
        if (typeof M == "function")
          et = function () {
            M(At);
          };
        else if (typeof MessageChannel < "u") {
          var gt = new MessageChannel(),
            Tt = gt.port2;
          (gt.port1.onmessage = At),
            (et = function () {
              Tt.postMessage(null);
            });
        } else
          et = function () {
            b(At, 0);
          };
        function je(D) {
          (Ye = D), ze || ((ze = !0), et());
        }
        function _e(D, j) {
          at = b(function () {
            D(r.unstable_now());
          }, j);
        }
        (r.unstable_IdlePriority = 5),
          (r.unstable_ImmediatePriority = 1),
          (r.unstable_LowPriority = 4),
          (r.unstable_NormalPriority = 3),
          (r.unstable_Profiling = null),
          (r.unstable_UserBlockingPriority = 2),
          (r.unstable_cancelCallback = function (D) {
            D.callback = null;
          }),
          (r.unstable_continueExecution = function () {
            Q || z || ((Q = !0), je(Ae));
          }),
          (r.unstable_forceFrameRate = function (D) {
            0 > D || 125 < D
              ? console.error(
                  "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
                )
              : (Kt = 0 < D ? Math.floor(1e3 / D) : 5);
          }),
          (r.unstable_getCurrentPriorityLevel = function () {
            return L;
          }),
          (r.unstable_getFirstCallbackNode = function () {
            return l(_);
          }),
          (r.unstable_next = function (D) {
            switch (L) {
              case 1:
              case 2:
              case 3:
                var j = 3;
                break;
              default:
                j = L;
            }
            var F = L;
            L = j;
            try {
              return D();
            } finally {
              L = F;
            }
          }),
          (r.unstable_pauseExecution = function () {}),
          (r.unstable_requestPaint = function () {}),
          (r.unstable_runWithPriority = function (D, j) {
            switch (D) {
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
                break;
              default:
                D = 3;
            }
            var F = L;
            L = D;
            try {
              return j();
            } finally {
              L = F;
            }
          }),
          (r.unstable_scheduleCallback = function (D, j, F) {
            var y = r.unstable_now();
            switch (
              (typeof F == "object" && F !== null
                ? ((F = F.delay),
                  (F = typeof F == "number" && 0 < F ? y + F : y))
                : (F = y),
              D)
            ) {
              case 1:
                var A = -1;
                break;
              case 2:
                A = 250;
                break;
              case 5:
                A = 1073741823;
                break;
              case 4:
                A = 1e4;
                break;
              default:
                A = 5e3;
            }
            return (
              (A = F + A),
              (D = {
                id: O++,
                callback: j,
                priorityLevel: D,
                startTime: F,
                expirationTime: A,
                sortIndex: -1,
              }),
              F > y
                ? ((D.sortIndex = F),
                  i(w, D),
                  l(_) === null &&
                    D === l(w) &&
                    (X ? (ee(at), (at = -1)) : (X = !0), _e(se, F - y)))
                : ((D.sortIndex = A), i(_, D), Q || z || ((Q = !0), je(Ae))),
              D
            );
          }),
          (r.unstable_shouldYield = _n),
          (r.unstable_wrapCallback = function (D) {
            var j = L;
            return function () {
              var F = L;
              L = j;
              try {
                return D.apply(this, arguments);
              } finally {
                L = F;
              }
            };
          });
      })(oa)),
    oa
  );
}
var mf;
function Av() {
  return mf || ((mf = 1), (la.exports = kv())), la.exports;
}
var gf;
function Tv() {
  if (gf) return Ze;
  gf = 1;
  var r = qa(),
    i = Av();
  function l(e) {
    for (
      var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e,
        n = 1;
      n < arguments.length;
      n++
    )
      t += "&args[]=" + encodeURIComponent(arguments[n]);
    return (
      "Minified React error #" +
      e +
      "; visit " +
      t +
      " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    );
  }
  var u = new Set(),
    c = {};
  function f(e, t) {
    h(e, t), h(e + "Capture", t);
  }
  function h(e, t) {
    for (c[e] = t, e = 0; e < t.length; e++) u.add(t[e]);
  }
  var g = !(
      typeof window > "u" ||
      typeof window.document > "u" ||
      typeof window.document.createElement > "u"
    ),
    _ = Object.prototype.hasOwnProperty,
    w =
      /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
    O = {},
    R = {};
  function L(e) {
    return _.call(R, e)
      ? !0
      : _.call(O, e)
        ? !1
        : w.test(e)
          ? (R[e] = !0)
          : ((O[e] = !0), !1);
  }
  function z(e, t, n, s) {
    if (n !== null && n.type === 0) return !1;
    switch (typeof t) {
      case "function":
      case "symbol":
        return !0;
      case "boolean":
        return s
          ? !1
          : n !== null
            ? !n.acceptsBooleans
            : ((e = e.toLowerCase().slice(0, 5)),
              e !== "data-" && e !== "aria-");
      default:
        return !1;
    }
  }
  function Q(e, t, n, s) {
    if (t === null || typeof t > "u" || z(e, t, n, s)) return !0;
    if (s) return !1;
    if (n !== null)
      switch (n.type) {
        case 3:
          return !t;
        case 4:
          return t === !1;
        case 5:
          return isNaN(t);
        case 6:
          return isNaN(t) || 1 > t;
      }
    return !1;
  }
  function X(e, t, n, s, o, a, d) {
    (this.acceptsBooleans = t === 2 || t === 3 || t === 4),
      (this.attributeName = s),
      (this.attributeNamespace = o),
      (this.mustUseProperty = n),
      (this.propertyName = e),
      (this.type = t),
      (this.sanitizeURL = a),
      (this.removeEmptyString = d);
  }
  var b = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style"
    .split(" ")
    .forEach(function (e) {
      b[e] = new X(e, 0, !1, e, null, !1, !1);
    }),
    [
      ["acceptCharset", "accept-charset"],
      ["className", "class"],
      ["htmlFor", "for"],
      ["httpEquiv", "http-equiv"],
    ].forEach(function (e) {
      var t = e[0];
      b[t] = new X(t, 1, !1, e[1], null, !1, !1);
    }),
    ["contentEditable", "draggable", "spellCheck", "value"].forEach(
      function (e) {
        b[e] = new X(e, 2, !1, e.toLowerCase(), null, !1, !1);
      },
    ),
    [
      "autoReverse",
      "externalResourcesRequired",
      "focusable",
      "preserveAlpha",
    ].forEach(function (e) {
      b[e] = new X(e, 2, !1, e, null, !1, !1);
    }),
    "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope"
      .split(" ")
      .forEach(function (e) {
        b[e] = new X(e, 3, !1, e.toLowerCase(), null, !1, !1);
      }),
    ["checked", "multiple", "muted", "selected"].forEach(function (e) {
      b[e] = new X(e, 3, !0, e, null, !1, !1);
    }),
    ["capture", "download"].forEach(function (e) {
      b[e] = new X(e, 4, !1, e, null, !1, !1);
    }),
    ["cols", "rows", "size", "span"].forEach(function (e) {
      b[e] = new X(e, 6, !1, e, null, !1, !1);
    }),
    ["rowSpan", "start"].forEach(function (e) {
      b[e] = new X(e, 5, !1, e.toLowerCase(), null, !1, !1);
    });
  var ee = /[\-:]([a-z])/g;
  function M(e) {
    return e[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height"
    .split(" ")
    .forEach(function (e) {
      var t = e.replace(ee, M);
      b[t] = new X(t, 1, !1, e, null, !1, !1);
    }),
    "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type"
      .split(" ")
      .forEach(function (e) {
        var t = e.replace(ee, M);
        b[t] = new X(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
      }),
    ["xml:base", "xml:lang", "xml:space"].forEach(function (e) {
      var t = e.replace(ee, M);
      b[t] = new X(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
    }),
    ["tabIndex", "crossOrigin"].forEach(function (e) {
      b[e] = new X(e, 1, !1, e.toLowerCase(), null, !1, !1);
    }),
    (b.xlinkHref = new X(
      "xlinkHref",
      1,
      !1,
      "xlink:href",
      "http://www.w3.org/1999/xlink",
      !0,
      !1,
    )),
    ["src", "href", "action", "formAction"].forEach(function (e) {
      b[e] = new X(e, 1, !1, e.toLowerCase(), null, !0, !0);
    });
  function J(e, t, n, s) {
    var o = b.hasOwnProperty(t) ? b[t] : null;
    (o !== null
      ? o.type !== 0
      : s ||
        !(2 < t.length) ||
        (t[0] !== "o" && t[0] !== "O") ||
        (t[1] !== "n" && t[1] !== "N")) &&
      (Q(t, n, o, s) && (n = null),
      s || o === null
        ? L(t) &&
          (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n))
        : o.mustUseProperty
          ? (e[o.propertyName] = n === null ? (o.type === 3 ? !1 : "") : n)
          : ((t = o.attributeName),
            (s = o.attributeNamespace),
            n === null
              ? e.removeAttribute(t)
              : ((o = o.type),
                (n = o === 3 || (o === 4 && n === !0) ? "" : "" + n),
                s ? e.setAttributeNS(s, t, n) : e.setAttribute(t, n))));
  }
  var se = r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
    Ae = Symbol.for("react.element"),
    ze = Symbol.for("react.portal"),
    Ye = Symbol.for("react.fragment"),
    at = Symbol.for("react.strict_mode"),
    Kt = Symbol.for("react.profiler"),
    Bt = Symbol.for("react.provider"),
    _n = Symbol.for("react.context"),
    At = Symbol.for("react.forward_ref"),
    et = Symbol.for("react.suspense"),
    gt = Symbol.for("react.suspense_list"),
    Tt = Symbol.for("react.memo"),
    je = Symbol.for("react.lazy"),
    _e = Symbol.for("react.offscreen"),
    D = Symbol.iterator;
  function j(e) {
    return e === null || typeof e != "object"
      ? null
      : ((e = (D && e[D]) || e["@@iterator"]),
        typeof e == "function" ? e : null);
  }
  var F = Object.assign,
    y;
  function A(e) {
    if (y === void 0)
      try {
        throw Error();
      } catch (n) {
        var t = n.stack.trim().match(/\n( *(at )?)/);
        y = (t && t[1]) || "";
      }
    return (
      `
` +
      y +
      e
    );
  }
  var K = !1;
  function q(e, t) {
    if (!e || K) return "";
    K = !0;
    var n = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      if (t)
        if (
          ((t = function () {
            throw Error();
          }),
          Object.defineProperty(t.prototype, "props", {
            set: function () {
              throw Error();
            },
          }),
          typeof Reflect == "object" && Reflect.construct)
        ) {
          try {
            Reflect.construct(t, []);
          } catch (C) {
            var s = C;
          }
          Reflect.construct(e, [], t);
        } else {
          try {
            t.call();
          } catch (C) {
            s = C;
          }
          e.call(t.prototype);
        }
      else {
        try {
          throw Error();
        } catch (C) {
          s = C;
        }
        e();
      }
    } catch (C) {
      if (C && s && typeof C.stack == "string") {
        for (
          var o = C.stack.split(`
`),
            a = s.stack.split(`
`),
            d = o.length - 1,
            p = a.length - 1;
          1 <= d && 0 <= p && o[d] !== a[p];

        )
          p--;
        for (; 1 <= d && 0 <= p; d--, p--)
          if (o[d] !== a[p]) {
            if (d !== 1 || p !== 1)
              do
                if ((d--, p--, 0 > p || o[d] !== a[p])) {
                  var m =
                    `
` + o[d].replace(" at new ", " at ");
                  return (
                    e.displayName &&
                      m.includes("<anonymous>") &&
                      (m = m.replace("<anonymous>", e.displayName)),
                    m
                  );
                }
              while (1 <= d && 0 <= p);
            break;
          }
      }
    } finally {
      (K = !1), (Error.prepareStackTrace = n);
    }
    return (e = e ? e.displayName || e.name : "") ? A(e) : "";
  }
  function ne(e) {
    switch (e.tag) {
      case 5:
        return A(e.type);
      case 16:
        return A("Lazy");
      case 13:
        return A("Suspense");
      case 19:
        return A("SuspenseList");
      case 0:
      case 2:
      case 15:
        return (e = q(e.type, !1)), e;
      case 11:
        return (e = q(e.type.render, !1)), e;
      case 1:
        return (e = q(e.type, !0)), e;
      default:
        return "";
    }
  }
  function re(e) {
    if (e == null) return null;
    if (typeof e == "function") return e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case Ye:
        return "Fragment";
      case ze:
        return "Portal";
      case Kt:
        return "Profiler";
      case at:
        return "StrictMode";
      case et:
        return "Suspense";
      case gt:
        return "SuspenseList";
    }
    if (typeof e == "object")
      switch (e.$$typeof) {
        case _n:
          return (e.displayName || "Context") + ".Consumer";
        case Bt:
          return (e._context.displayName || "Context") + ".Provider";
        case At:
          var t = e.render;
          return (
            (e = e.displayName),
            e ||
              ((e = t.displayName || t.name || ""),
              (e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")),
            e
          );
        case Tt:
          return (
            (t = e.displayName || null), t !== null ? t : re(e.type) || "Memo"
          );
        case je:
          (t = e._payload), (e = e._init);
          try {
            return re(e(t));
          } catch {}
      }
    return null;
  }
  function ce(e) {
    var t = e.type;
    switch (e.tag) {
      case 24:
        return "Cache";
      case 9:
        return (t.displayName || "Context") + ".Consumer";
      case 10:
        return (t._context.displayName || "Context") + ".Provider";
      case 18:
        return "DehydratedFragment";
      case 11:
        return (
          (e = t.render),
          (e = e.displayName || e.name || ""),
          t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")
        );
      case 7:
        return "Fragment";
      case 5:
        return t;
      case 4:
        return "Portal";
      case 3:
        return "Root";
      case 6:
        return "Text";
      case 16:
        return re(t);
      case 8:
        return t === at ? "StrictMode" : "Mode";
      case 22:
        return "Offscreen";
      case 12:
        return "Profiler";
      case 21:
        return "Scope";
      case 13:
        return "Suspense";
      case 19:
        return "SuspenseList";
      case 25:
        return "TracingMarker";
      case 1:
      case 0:
      case 17:
      case 2:
      case 14:
      case 15:
        if (typeof t == "function") return t.displayName || t.name || null;
        if (typeof t == "string") return t;
    }
    return null;
  }
  function le(e) {
    switch (typeof e) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return e;
      case "object":
        return e;
      default:
        return "";
    }
  }
  function me(e) {
    var t = e.type;
    return (
      (e = e.nodeName) &&
      e.toLowerCase() === "input" &&
      (t === "checkbox" || t === "radio")
    );
  }
  function tt(e) {
    var t = me(e) ? "checked" : "value",
      n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
      s = "" + e[t];
    if (
      !e.hasOwnProperty(t) &&
      typeof n < "u" &&
      typeof n.get == "function" &&
      typeof n.set == "function"
    ) {
      var o = n.get,
        a = n.set;
      return (
        Object.defineProperty(e, t, {
          configurable: !0,
          get: function () {
            return o.call(this);
          },
          set: function (d) {
            (s = "" + d), a.call(this, d);
          },
        }),
        Object.defineProperty(e, t, { enumerable: n.enumerable }),
        {
          getValue: function () {
            return s;
          },
          setValue: function (d) {
            s = "" + d;
          },
          stopTracking: function () {
            (e._valueTracker = null), delete e[t];
          },
        }
      );
    }
  }
  function Oi(e) {
    e._valueTracker || (e._valueTracker = tt(e));
  }
  function pu(e) {
    if (!e) return !1;
    var t = e._valueTracker;
    if (!t) return !0;
    var n = t.getValue(),
      s = "";
    return (
      e && (s = me(e) ? (e.checked ? "true" : "false") : e.value),
      (e = s),
      e !== n ? (t.setValue(e), !0) : !1
    );
  }
  function Pi(e) {
    if (
      ((e = e || (typeof document < "u" ? document : void 0)), typeof e > "u")
    )
      return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  function ul(e, t) {
    var n = t.checked;
    return F({}, t, {
      defaultChecked: void 0,
      defaultValue: void 0,
      value: void 0,
      checked: n ?? e._wrapperState.initialChecked,
    });
  }
  function mu(e, t) {
    var n = t.defaultValue == null ? "" : t.defaultValue,
      s = t.checked != null ? t.checked : t.defaultChecked;
    (n = le(t.value != null ? t.value : n)),
      (e._wrapperState = {
        initialChecked: s,
        initialValue: n,
        controlled:
          t.type === "checkbox" || t.type === "radio"
            ? t.checked != null
            : t.value != null,
      });
  }
  function gu(e, t) {
    (t = t.checked), t != null && J(e, "checked", t, !1);
  }
  function cl(e, t) {
    gu(e, t);
    var n = le(t.value),
      s = t.type;
    if (n != null)
      s === "number"
        ? ((n === 0 && e.value === "") || e.value != n) && (e.value = "" + n)
        : e.value !== "" + n && (e.value = "" + n);
    else if (s === "submit" || s === "reset") {
      e.removeAttribute("value");
      return;
    }
    t.hasOwnProperty("value")
      ? dl(e, t.type, n)
      : t.hasOwnProperty("defaultValue") && dl(e, t.type, le(t.defaultValue)),
      t.checked == null &&
        t.defaultChecked != null &&
        (e.defaultChecked = !!t.defaultChecked);
  }
  function vu(e, t, n) {
    if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
      var s = t.type;
      if (
        !(
          (s !== "submit" && s !== "reset") ||
          (t.value !== void 0 && t.value !== null)
        )
      )
        return;
      (t = "" + e._wrapperState.initialValue),
        n || t === e.value || (e.value = t),
        (e.defaultValue = t);
    }
    (n = e.name),
      n !== "" && (e.name = ""),
      (e.defaultChecked = !!e._wrapperState.initialChecked),
      n !== "" && (e.name = n);
  }
  function dl(e, t, n) {
    (t !== "number" || Pi(e.ownerDocument) !== e) &&
      (n == null
        ? (e.defaultValue = "" + e._wrapperState.initialValue)
        : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
  }
  var kr = Array.isArray;
  function Wn(e, t, n, s) {
    if (((e = e.options), t)) {
      t = {};
      for (var o = 0; o < n.length; o++) t["$" + n[o]] = !0;
      for (n = 0; n < e.length; n++)
        (o = t.hasOwnProperty("$" + e[n].value)),
          e[n].selected !== o && (e[n].selected = o),
          o && s && (e[n].defaultSelected = !0);
    } else {
      for (n = "" + le(n), t = null, o = 0; o < e.length; o++) {
        if (e[o].value === n) {
          (e[o].selected = !0), s && (e[o].defaultSelected = !0);
          return;
        }
        t !== null || e[o].disabled || (t = e[o]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function fl(e, t) {
    if (t.dangerouslySetInnerHTML != null) throw Error(l(91));
    return F({}, t, {
      value: void 0,
      defaultValue: void 0,
      children: "" + e._wrapperState.initialValue,
    });
  }
  function yu(e, t) {
    var n = t.value;
    if (n == null) {
      if (((n = t.children), (t = t.defaultValue), n != null)) {
        if (t != null) throw Error(l(92));
        if (kr(n)) {
          if (1 < n.length) throw Error(l(93));
          n = n[0];
        }
        t = n;
      }
      t == null && (t = ""), (n = t);
    }
    e._wrapperState = { initialValue: le(n) };
  }
  function Su(e, t) {
    var n = le(t.value),
      s = le(t.defaultValue);
    n != null &&
      ((n = "" + n),
      n !== e.value && (e.value = n),
      t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
      s != null && (e.defaultValue = "" + s);
  }
  function _u(e) {
    var t = e.textContent;
    t === e._wrapperState.initialValue &&
      t !== "" &&
      t !== null &&
      (e.value = t);
  }
  function Eu(e) {
    switch (e) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function hl(e, t) {
    return e == null || e === "http://www.w3.org/1999/xhtml"
      ? Eu(t)
      : e === "http://www.w3.org/2000/svg" && t === "foreignObject"
        ? "http://www.w3.org/1999/xhtml"
        : e;
  }
  var Ii,
    wu = (function (e) {
      return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction
        ? function (t, n, s, o) {
            MSApp.execUnsafeLocalFunction(function () {
              return e(t, n, s, o);
            });
          }
        : e;
    })(function (e, t) {
      if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e)
        e.innerHTML = t;
      else {
        for (
          Ii = Ii || document.createElement("div"),
            Ii.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>",
            t = Ii.firstChild;
          e.firstChild;

        )
          e.removeChild(e.firstChild);
        for (; t.firstChild; ) e.appendChild(t.firstChild);
      }
    });
  function Ar(e, t) {
    if (t) {
      var n = e.firstChild;
      if (n && n === e.lastChild && n.nodeType === 3) {
        n.nodeValue = t;
        return;
      }
    }
    e.textContent = t;
  }
  var Tr = {
      animationIterationCount: !0,
      aspectRatio: !0,
      borderImageOutset: !0,
      borderImageSlice: !0,
      borderImageWidth: !0,
      boxFlex: !0,
      boxFlexGroup: !0,
      boxOrdinalGroup: !0,
      columnCount: !0,
      columns: !0,
      flex: !0,
      flexGrow: !0,
      flexPositive: !0,
      flexShrink: !0,
      flexNegative: !0,
      flexOrder: !0,
      gridArea: !0,
      gridRow: !0,
      gridRowEnd: !0,
      gridRowSpan: !0,
      gridRowStart: !0,
      gridColumn: !0,
      gridColumnEnd: !0,
      gridColumnSpan: !0,
      gridColumnStart: !0,
      fontWeight: !0,
      lineClamp: !0,
      lineHeight: !0,
      opacity: !0,
      order: !0,
      orphans: !0,
      tabSize: !0,
      widows: !0,
      zIndex: !0,
      zoom: !0,
      fillOpacity: !0,
      floodOpacity: !0,
      stopOpacity: !0,
      strokeDasharray: !0,
      strokeDashoffset: !0,
      strokeMiterlimit: !0,
      strokeOpacity: !0,
      strokeWidth: !0,
    },
    Cm = ["Webkit", "ms", "Moz", "O"];
  Object.keys(Tr).forEach(function (e) {
    Cm.forEach(function (t) {
      (t = t + e.charAt(0).toUpperCase() + e.substring(1)), (Tr[t] = Tr[e]);
    });
  });
  function Cu(e, t, n) {
    return t == null || typeof t == "boolean" || t === ""
      ? ""
      : n || typeof t != "number" || t === 0 || (Tr.hasOwnProperty(e) && Tr[e])
        ? ("" + t).trim()
        : t + "px";
  }
  function ku(e, t) {
    e = e.style;
    for (var n in t)
      if (t.hasOwnProperty(n)) {
        var s = n.indexOf("--") === 0,
          o = Cu(n, t[n], s);
        n === "float" && (n = "cssFloat"), s ? e.setProperty(n, o) : (e[n] = o);
      }
  }
  var km = F(
    { menuitem: !0 },
    {
      area: !0,
      base: !0,
      br: !0,
      col: !0,
      embed: !0,
      hr: !0,
      img: !0,
      input: !0,
      keygen: !0,
      link: !0,
      meta: !0,
      param: !0,
      source: !0,
      track: !0,
      wbr: !0,
    },
  );
  function pl(e, t) {
    if (t) {
      if (km[e] && (t.children != null || t.dangerouslySetInnerHTML != null))
        throw Error(l(137, e));
      if (t.dangerouslySetInnerHTML != null) {
        if (t.children != null) throw Error(l(60));
        if (
          typeof t.dangerouslySetInnerHTML != "object" ||
          !("__html" in t.dangerouslySetInnerHTML)
        )
          throw Error(l(61));
      }
      if (t.style != null && typeof t.style != "object") throw Error(l(62));
    }
  }
  function ml(e, t) {
    if (e.indexOf("-") === -1) return typeof t.is == "string";
    switch (e) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var gl = null;
  function vl(e) {
    return (
      (e = e.target || e.srcElement || window),
      e.correspondingUseElement && (e = e.correspondingUseElement),
      e.nodeType === 3 ? e.parentNode : e
    );
  }
  var yl = null,
    Yn = null,
    jn = null;
  function Au(e) {
    if ((e = Xr(e))) {
      if (typeof yl != "function") throw Error(l(280));
      var t = e.stateNode;
      t && ((t = ts(t)), yl(e.stateNode, e.type, t));
    }
  }
  function Tu(e) {
    Yn ? (jn ? jn.push(e) : (jn = [e])) : (Yn = e);
  }
  function Ru() {
    if (Yn) {
      var e = Yn,
        t = jn;
      if (((jn = Yn = null), Au(e), t)) for (e = 0; e < t.length; e++) Au(t[e]);
    }
  }
  function Lu(e, t) {
    return e(t);
  }
  function Nu() {}
  var Sl = !1;
  function Ou(e, t, n) {
    if (Sl) return e(t, n);
    Sl = !0;
    try {
      return Lu(e, t, n);
    } finally {
      (Sl = !1), (Yn !== null || jn !== null) && (Nu(), Ru());
    }
  }
  function Rr(e, t) {
    var n = e.stateNode;
    if (n === null) return null;
    var s = ts(n);
    if (s === null) return null;
    n = s[t];
    e: switch (t) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (s = !s.disabled) ||
          ((e = e.type),
          (s = !(
            e === "button" ||
            e === "input" ||
            e === "select" ||
            e === "textarea"
          ))),
          (e = !s);
        break e;
      default:
        e = !1;
    }
    if (e) return null;
    if (n && typeof n != "function") throw Error(l(231, t, typeof n));
    return n;
  }
  var _l = !1;
  if (g)
    try {
      var Lr = {};
      Object.defineProperty(Lr, "passive", {
        get: function () {
          _l = !0;
        },
      }),
        window.addEventListener("test", Lr, Lr),
        window.removeEventListener("test", Lr, Lr);
    } catch {
      _l = !1;
    }
  function Am(e, t, n, s, o, a, d, p, m) {
    var C = Array.prototype.slice.call(arguments, 3);
    try {
      t.apply(n, C);
    } catch (T) {
      this.onError(T);
    }
  }
  var Nr = !1,
    Mi = null,
    Di = !1,
    El = null,
    Tm = {
      onError: function (e) {
        (Nr = !0), (Mi = e);
      },
    };
  function Rm(e, t, n, s, o, a, d, p, m) {
    (Nr = !1), (Mi = null), Am.apply(Tm, arguments);
  }
  function Lm(e, t, n, s, o, a, d, p, m) {
    if ((Rm.apply(this, arguments), Nr)) {
      if (Nr) {
        var C = Mi;
        (Nr = !1), (Mi = null);
      } else throw Error(l(198));
      Di || ((Di = !0), (El = C));
    }
  }
  function En(e) {
    var t = e,
      n = e;
    if (e.alternate) for (; t.return; ) t = t.return;
    else {
      e = t;
      do (t = e), (t.flags & 4098) !== 0 && (n = t.return), (e = t.return);
      while (e);
    }
    return t.tag === 3 ? n : null;
  }
  function Pu(e) {
    if (e.tag === 13) {
      var t = e.memoizedState;
      if (
        (t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)),
        t !== null)
      )
        return t.dehydrated;
    }
    return null;
  }
  function Iu(e) {
    if (En(e) !== e) throw Error(l(188));
  }
  function Nm(e) {
    var t = e.alternate;
    if (!t) {
      if (((t = En(e)), t === null)) throw Error(l(188));
      return t !== e ? null : e;
    }
    for (var n = e, s = t; ; ) {
      var o = n.return;
      if (o === null) break;
      var a = o.alternate;
      if (a === null) {
        if (((s = o.return), s !== null)) {
          n = s;
          continue;
        }
        break;
      }
      if (o.child === a.child) {
        for (a = o.child; a; ) {
          if (a === n) return Iu(o), e;
          if (a === s) return Iu(o), t;
          a = a.sibling;
        }
        throw Error(l(188));
      }
      if (n.return !== s.return) (n = o), (s = a);
      else {
        for (var d = !1, p = o.child; p; ) {
          if (p === n) {
            (d = !0), (n = o), (s = a);
            break;
          }
          if (p === s) {
            (d = !0), (s = o), (n = a);
            break;
          }
          p = p.sibling;
        }
        if (!d) {
          for (p = a.child; p; ) {
            if (p === n) {
              (d = !0), (n = a), (s = o);
              break;
            }
            if (p === s) {
              (d = !0), (s = a), (n = o);
              break;
            }
            p = p.sibling;
          }
          if (!d) throw Error(l(189));
        }
      }
      if (n.alternate !== s) throw Error(l(190));
    }
    if (n.tag !== 3) throw Error(l(188));
    return n.stateNode.current === n ? e : t;
  }
  function Mu(e) {
    return (e = Nm(e)), e !== null ? Du(e) : null;
  }
  function Du(e) {
    if (e.tag === 5 || e.tag === 6) return e;
    for (e = e.child; e !== null; ) {
      var t = Du(e);
      if (t !== null) return t;
      e = e.sibling;
    }
    return null;
  }
  var Bu = i.unstable_scheduleCallback,
    xu = i.unstable_cancelCallback,
    Om = i.unstable_shouldYield,
    Pm = i.unstable_requestPaint,
    we = i.unstable_now,
    Im = i.unstable_getCurrentPriorityLevel,
    wl = i.unstable_ImmediatePriority,
    Fu = i.unstable_UserBlockingPriority,
    Bi = i.unstable_NormalPriority,
    Mm = i.unstable_LowPriority,
    Hu = i.unstable_IdlePriority,
    xi = null,
    Rt = null;
  function Dm(e) {
    if (Rt && typeof Rt.onCommitFiberRoot == "function")
      try {
        Rt.onCommitFiberRoot(xi, e, void 0, (e.current.flags & 128) === 128);
      } catch {}
  }
  var vt = Math.clz32 ? Math.clz32 : Fm,
    Bm = Math.log,
    xm = Math.LN2;
  function Fm(e) {
    return (e >>>= 0), e === 0 ? 32 : (31 - ((Bm(e) / xm) | 0)) | 0;
  }
  var Fi = 64,
    Hi = 4194304;
  function Or(e) {
    switch (e & -e) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return e & 4194240;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return e & 130023424;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 1073741824;
      default:
        return e;
    }
  }
  function Ui(e, t) {
    var n = e.pendingLanes;
    if (n === 0) return 0;
    var s = 0,
      o = e.suspendedLanes,
      a = e.pingedLanes,
      d = n & 268435455;
    if (d !== 0) {
      var p = d & ~o;
      p !== 0 ? (s = Or(p)) : ((a &= d), a !== 0 && (s = Or(a)));
    } else (d = n & ~o), d !== 0 ? (s = Or(d)) : a !== 0 && (s = Or(a));
    if (s === 0) return 0;
    if (
      t !== 0 &&
      t !== s &&
      (t & o) === 0 &&
      ((o = s & -s), (a = t & -t), o >= a || (o === 16 && (a & 4194240) !== 0))
    )
      return t;
    if (((s & 4) !== 0 && (s |= n & 16), (t = e.entangledLanes), t !== 0))
      for (e = e.entanglements, t &= s; 0 < t; )
        (n = 31 - vt(t)), (o = 1 << n), (s |= e[n]), (t &= ~o);
    return s;
  }
  function Hm(e, t) {
    switch (e) {
      case 1:
      case 2:
      case 4:
        return t + 250;
      case 8:
      case 16:
      case 32:
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return -1;
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function Um(e, t) {
    for (
      var n = e.suspendedLanes,
        s = e.pingedLanes,
        o = e.expirationTimes,
        a = e.pendingLanes;
      0 < a;

    ) {
      var d = 31 - vt(a),
        p = 1 << d,
        m = o[d];
      m === -1
        ? ((p & n) === 0 || (p & s) !== 0) && (o[d] = Hm(p, t))
        : m <= t && (e.expiredLanes |= p),
        (a &= ~p);
    }
  }
  function Cl(e) {
    return (
      (e = e.pendingLanes & -1073741825),
      e !== 0 ? e : e & 1073741824 ? 1073741824 : 0
    );
  }
  function Uu() {
    var e = Fi;
    return (Fi <<= 1), (Fi & 4194240) === 0 && (Fi = 64), e;
  }
  function kl(e) {
    for (var t = [], n = 0; 31 > n; n++) t.push(e);
    return t;
  }
  function Pr(e, t, n) {
    (e.pendingLanes |= t),
      t !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
      (e = e.eventTimes),
      (t = 31 - vt(t)),
      (e[t] = n);
  }
  function Gm(e, t) {
    var n = e.pendingLanes & ~t;
    (e.pendingLanes = t),
      (e.suspendedLanes = 0),
      (e.pingedLanes = 0),
      (e.expiredLanes &= t),
      (e.mutableReadLanes &= t),
      (e.entangledLanes &= t),
      (t = e.entanglements);
    var s = e.eventTimes;
    for (e = e.expirationTimes; 0 < n; ) {
      var o = 31 - vt(n),
        a = 1 << o;
      (t[o] = 0), (s[o] = -1), (e[o] = -1), (n &= ~a);
    }
  }
  function Al(e, t) {
    var n = (e.entangledLanes |= t);
    for (e = e.entanglements; n; ) {
      var s = 31 - vt(n),
        o = 1 << s;
      (o & t) | (e[s] & t) && (e[s] |= t), (n &= ~o);
    }
  }
  var oe = 0;
  function Gu(e) {
    return (
      (e &= -e),
      1 < e ? (4 < e ? ((e & 268435455) !== 0 ? 16 : 536870912) : 4) : 1
    );
  }
  var zu,
    Tl,
    bu,
    Wu,
    Yu,
    Rl = !1,
    Gi = [],
    Qt = null,
    Zt = null,
    qt = null,
    Ir = new Map(),
    Mr = new Map(),
    Jt = [],
    zm =
      "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(
        " ",
      );
  function ju(e, t) {
    switch (e) {
      case "focusin":
      case "focusout":
        Qt = null;
        break;
      case "dragenter":
      case "dragleave":
        Zt = null;
        break;
      case "mouseover":
      case "mouseout":
        qt = null;
        break;
      case "pointerover":
      case "pointerout":
        Ir.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        Mr.delete(t.pointerId);
    }
  }
  function Dr(e, t, n, s, o, a) {
    return e === null || e.nativeEvent !== a
      ? ((e = {
          blockedOn: t,
          domEventName: n,
          eventSystemFlags: s,
          nativeEvent: a,
          targetContainers: [o],
        }),
        t !== null && ((t = Xr(t)), t !== null && Tl(t)),
        e)
      : ((e.eventSystemFlags |= s),
        (t = e.targetContainers),
        o !== null && t.indexOf(o) === -1 && t.push(o),
        e);
  }
  function bm(e, t, n, s, o) {
    switch (t) {
      case "focusin":
        return (Qt = Dr(Qt, e, t, n, s, o)), !0;
      case "dragenter":
        return (Zt = Dr(Zt, e, t, n, s, o)), !0;
      case "mouseover":
        return (qt = Dr(qt, e, t, n, s, o)), !0;
      case "pointerover":
        var a = o.pointerId;
        return Ir.set(a, Dr(Ir.get(a) || null, e, t, n, s, o)), !0;
      case "gotpointercapture":
        return (
          (a = o.pointerId), Mr.set(a, Dr(Mr.get(a) || null, e, t, n, s, o)), !0
        );
    }
    return !1;
  }
  function Vu(e) {
    var t = wn(e.target);
    if (t !== null) {
      var n = En(t);
      if (n !== null) {
        if (((t = n.tag), t === 13)) {
          if (((t = Pu(n)), t !== null)) {
            (e.blockedOn = t),
              Yu(e.priority, function () {
                bu(n);
              });
            return;
          }
        } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
          e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
          return;
        }
      }
    }
    e.blockedOn = null;
  }
  function zi(e) {
    if (e.blockedOn !== null) return !1;
    for (var t = e.targetContainers; 0 < t.length; ) {
      var n = Nl(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
      if (n === null) {
        n = e.nativeEvent;
        var s = new n.constructor(n.type, n);
        (gl = s), n.target.dispatchEvent(s), (gl = null);
      } else return (t = Xr(n)), t !== null && Tl(t), (e.blockedOn = n), !1;
      t.shift();
    }
    return !0;
  }
  function $u(e, t, n) {
    zi(e) && n.delete(t);
  }
  function Wm() {
    (Rl = !1),
      Qt !== null && zi(Qt) && (Qt = null),
      Zt !== null && zi(Zt) && (Zt = null),
      qt !== null && zi(qt) && (qt = null),
      Ir.forEach($u),
      Mr.forEach($u);
  }
  function Br(e, t) {
    e.blockedOn === t &&
      ((e.blockedOn = null),
      Rl ||
        ((Rl = !0),
        i.unstable_scheduleCallback(i.unstable_NormalPriority, Wm)));
  }
  function xr(e) {
    function t(o) {
      return Br(o, e);
    }
    if (0 < Gi.length) {
      Br(Gi[0], e);
      for (var n = 1; n < Gi.length; n++) {
        var s = Gi[n];
        s.blockedOn === e && (s.blockedOn = null);
      }
    }
    for (
      Qt !== null && Br(Qt, e),
        Zt !== null && Br(Zt, e),
        qt !== null && Br(qt, e),
        Ir.forEach(t),
        Mr.forEach(t),
        n = 0;
      n < Jt.length;
      n++
    )
      (s = Jt[n]), s.blockedOn === e && (s.blockedOn = null);
    for (; 0 < Jt.length && ((n = Jt[0]), n.blockedOn === null); )
      Vu(n), n.blockedOn === null && Jt.shift();
  }
  var Vn = se.ReactCurrentBatchConfig,
    bi = !0;
  function Ym(e, t, n, s) {
    var o = oe,
      a = Vn.transition;
    Vn.transition = null;
    try {
      (oe = 1), Ll(e, t, n, s);
    } finally {
      (oe = o), (Vn.transition = a);
    }
  }
  function jm(e, t, n, s) {
    var o = oe,
      a = Vn.transition;
    Vn.transition = null;
    try {
      (oe = 4), Ll(e, t, n, s);
    } finally {
      (oe = o), (Vn.transition = a);
    }
  }
  function Ll(e, t, n, s) {
    if (bi) {
      var o = Nl(e, t, n, s);
      if (o === null) Vl(e, t, s, Wi, n), ju(e, s);
      else if (bm(o, e, t, n, s)) s.stopPropagation();
      else if ((ju(e, s), t & 4 && -1 < zm.indexOf(e))) {
        for (; o !== null; ) {
          var a = Xr(o);
          if (
            (a !== null && zu(a),
            (a = Nl(e, t, n, s)),
            a === null && Vl(e, t, s, Wi, n),
            a === o)
          )
            break;
          o = a;
        }
        o !== null && s.stopPropagation();
      } else Vl(e, t, s, null, n);
    }
  }
  var Wi = null;
  function Nl(e, t, n, s) {
    if (((Wi = null), (e = vl(s)), (e = wn(e)), e !== null))
      if (((t = En(e)), t === null)) e = null;
      else if (((n = t.tag), n === 13)) {
        if (((e = Pu(t)), e !== null)) return e;
        e = null;
      } else if (n === 3) {
        if (t.stateNode.current.memoizedState.isDehydrated)
          return t.tag === 3 ? t.stateNode.containerInfo : null;
        e = null;
      } else t !== e && (e = null);
    return (Wi = e), null;
  }
  function Xu(e) {
    switch (e) {
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 1;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "toggle":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 4;
      case "message":
        switch (Im()) {
          case wl:
            return 1;
          case Fu:
            return 4;
          case Bi:
          case Mm:
            return 16;
          case Hu:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var en = null,
    Ol = null,
    Yi = null;
  function Ku() {
    if (Yi) return Yi;
    var e,
      t = Ol,
      n = t.length,
      s,
      o = "value" in en ? en.value : en.textContent,
      a = o.length;
    for (e = 0; e < n && t[e] === o[e]; e++);
    var d = n - e;
    for (s = 1; s <= d && t[n - s] === o[a - s]; s++);
    return (Yi = o.slice(e, 1 < s ? 1 - s : void 0));
  }
  function ji(e) {
    var t = e.keyCode;
    return (
      "charCode" in e
        ? ((e = e.charCode), e === 0 && t === 13 && (e = 13))
        : (e = t),
      e === 10 && (e = 13),
      32 <= e || e === 13 ? e : 0
    );
  }
  function Vi() {
    return !0;
  }
  function Qu() {
    return !1;
  }
  function nt(e) {
    function t(n, s, o, a, d) {
      (this._reactName = n),
        (this._targetInst = o),
        (this.type = s),
        (this.nativeEvent = a),
        (this.target = d),
        (this.currentTarget = null);
      for (var p in e)
        e.hasOwnProperty(p) && ((n = e[p]), (this[p] = n ? n(a) : a[p]));
      return (
        (this.isDefaultPrevented = (
          a.defaultPrevented != null ? a.defaultPrevented : a.returnValue === !1
        )
          ? Vi
          : Qu),
        (this.isPropagationStopped = Qu),
        this
      );
    }
    return (
      F(t.prototype, {
        preventDefault: function () {
          this.defaultPrevented = !0;
          var n = this.nativeEvent;
          n &&
            (n.preventDefault
              ? n.preventDefault()
              : typeof n.returnValue != "unknown" && (n.returnValue = !1),
            (this.isDefaultPrevented = Vi));
        },
        stopPropagation: function () {
          var n = this.nativeEvent;
          n &&
            (n.stopPropagation
              ? n.stopPropagation()
              : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
            (this.isPropagationStopped = Vi));
        },
        persist: function () {},
        isPersistent: Vi,
      }),
      t
    );
  }
  var $n = {
      eventPhase: 0,
      bubbles: 0,
      cancelable: 0,
      timeStamp: function (e) {
        return e.timeStamp || Date.now();
      },
      defaultPrevented: 0,
      isTrusted: 0,
    },
    Pl = nt($n),
    Fr = F({}, $n, { view: 0, detail: 0 }),
    Vm = nt(Fr),
    Il,
    Ml,
    Hr,
    $i = F({}, Fr, {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      getModifierState: Bl,
      button: 0,
      buttons: 0,
      relatedTarget: function (e) {
        return e.relatedTarget === void 0
          ? e.fromElement === e.srcElement
            ? e.toElement
            : e.fromElement
          : e.relatedTarget;
      },
      movementX: function (e) {
        return "movementX" in e
          ? e.movementX
          : (e !== Hr &&
              (Hr && e.type === "mousemove"
                ? ((Il = e.screenX - Hr.screenX), (Ml = e.screenY - Hr.screenY))
                : (Ml = Il = 0),
              (Hr = e)),
            Il);
      },
      movementY: function (e) {
        return "movementY" in e ? e.movementY : Ml;
      },
    }),
    Zu = nt($i),
    $m = F({}, $i, { dataTransfer: 0 }),
    Xm = nt($m),
    Km = F({}, Fr, { relatedTarget: 0 }),
    Dl = nt(Km),
    Qm = F({}, $n, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
    Zm = nt(Qm),
    qm = F({}, $n, {
      clipboardData: function (e) {
        return "clipboardData" in e ? e.clipboardData : window.clipboardData;
      },
    }),
    Jm = nt(qm),
    eg = F({}, $n, { data: 0 }),
    qu = nt(eg),
    tg = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified",
    },
    ng = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta",
    },
    rg = {
      Alt: "altKey",
      Control: "ctrlKey",
      Meta: "metaKey",
      Shift: "shiftKey",
    };
  function ig(e) {
    var t = this.nativeEvent;
    return t.getModifierState
      ? t.getModifierState(e)
      : (e = rg[e])
        ? !!t[e]
        : !1;
  }
  function Bl() {
    return ig;
  }
  var sg = F({}, Fr, {
      key: function (e) {
        if (e.key) {
          var t = tg[e.key] || e.key;
          if (t !== "Unidentified") return t;
        }
        return e.type === "keypress"
          ? ((e = ji(e)), e === 13 ? "Enter" : String.fromCharCode(e))
          : e.type === "keydown" || e.type === "keyup"
            ? ng[e.keyCode] || "Unidentified"
            : "";
      },
      code: 0,
      location: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      repeat: 0,
      locale: 0,
      getModifierState: Bl,
      charCode: function (e) {
        return e.type === "keypress" ? ji(e) : 0;
      },
      keyCode: function (e) {
        return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
      },
      which: function (e) {
        return e.type === "keypress"
          ? ji(e)
          : e.type === "keydown" || e.type === "keyup"
            ? e.keyCode
            : 0;
      },
    }),
    lg = nt(sg),
    og = F({}, $i, {
      pointerId: 0,
      width: 0,
      height: 0,
      pressure: 0,
      tangentialPressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
      pointerType: 0,
      isPrimary: 0,
    }),
    Ju = nt(og),
    ag = F({}, Fr, {
      touches: 0,
      targetTouches: 0,
      changedTouches: 0,
      altKey: 0,
      metaKey: 0,
      ctrlKey: 0,
      shiftKey: 0,
      getModifierState: Bl,
    }),
    ug = nt(ag),
    cg = F({}, $n, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
    dg = nt(cg),
    fg = F({}, $i, {
      deltaX: function (e) {
        return "deltaX" in e
          ? e.deltaX
          : "wheelDeltaX" in e
            ? -e.wheelDeltaX
            : 0;
      },
      deltaY: function (e) {
        return "deltaY" in e
          ? e.deltaY
          : "wheelDeltaY" in e
            ? -e.wheelDeltaY
            : "wheelDelta" in e
              ? -e.wheelDelta
              : 0;
      },
      deltaZ: 0,
      deltaMode: 0,
    }),
    hg = nt(fg),
    pg = [9, 13, 27, 32],
    xl = g && "CompositionEvent" in window,
    Ur = null;
  g && "documentMode" in document && (Ur = document.documentMode);
  var mg = g && "TextEvent" in window && !Ur,
    ec = g && (!xl || (Ur && 8 < Ur && 11 >= Ur)),
    tc = " ",
    nc = !1;
  function rc(e, t) {
    switch (e) {
      case "keyup":
        return pg.indexOf(t.keyCode) !== -1;
      case "keydown":
        return t.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function ic(e) {
    return (e = e.detail), typeof e == "object" && "data" in e ? e.data : null;
  }
  var Xn = !1;
  function gg(e, t) {
    switch (e) {
      case "compositionend":
        return ic(t);
      case "keypress":
        return t.which !== 32 ? null : ((nc = !0), tc);
      case "textInput":
        return (e = t.data), e === tc && nc ? null : e;
      default:
        return null;
    }
  }
  function vg(e, t) {
    if (Xn)
      return e === "compositionend" || (!xl && rc(e, t))
        ? ((e = Ku()), (Yi = Ol = en = null), (Xn = !1), e)
        : null;
    switch (e) {
      case "paste":
        return null;
      case "keypress":
        if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
          if (t.char && 1 < t.char.length) return t.char;
          if (t.which) return String.fromCharCode(t.which);
        }
        return null;
      case "compositionend":
        return ec && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var yg = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
  };
  function sc(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t === "input" ? !!yg[e.type] : t === "textarea";
  }
  function lc(e, t, n, s) {
    Tu(s),
      (t = qi(t, "onChange")),
      0 < t.length &&
        ((n = new Pl("onChange", "change", null, n, s)),
        e.push({ event: n, listeners: t }));
  }
  var Gr = null,
    zr = null;
  function Sg(e) {
    kc(e, 0);
  }
  function Xi(e) {
    var t = Jn(e);
    if (pu(t)) return e;
  }
  function _g(e, t) {
    if (e === "change") return t;
  }
  var oc = !1;
  if (g) {
    var Fl;
    if (g) {
      var Hl = "oninput" in document;
      if (!Hl) {
        var ac = document.createElement("div");
        ac.setAttribute("oninput", "return;"),
          (Hl = typeof ac.oninput == "function");
      }
      Fl = Hl;
    } else Fl = !1;
    oc = Fl && (!document.documentMode || 9 < document.documentMode);
  }
  function uc() {
    Gr && (Gr.detachEvent("onpropertychange", cc), (zr = Gr = null));
  }
  function cc(e) {
    if (e.propertyName === "value" && Xi(zr)) {
      var t = [];
      lc(t, zr, e, vl(e)), Ou(Sg, t);
    }
  }
  function Eg(e, t, n) {
    e === "focusin"
      ? (uc(), (Gr = t), (zr = n), Gr.attachEvent("onpropertychange", cc))
      : e === "focusout" && uc();
  }
  function wg(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown")
      return Xi(zr);
  }
  function Cg(e, t) {
    if (e === "click") return Xi(t);
  }
  function kg(e, t) {
    if (e === "input" || e === "change") return Xi(t);
  }
  function Ag(e, t) {
    return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
  }
  var yt = typeof Object.is == "function" ? Object.is : Ag;
  function br(e, t) {
    if (yt(e, t)) return !0;
    if (
      typeof e != "object" ||
      e === null ||
      typeof t != "object" ||
      t === null
    )
      return !1;
    var n = Object.keys(e),
      s = Object.keys(t);
    if (n.length !== s.length) return !1;
    for (s = 0; s < n.length; s++) {
      var o = n[s];
      if (!_.call(t, o) || !yt(e[o], t[o])) return !1;
    }
    return !0;
  }
  function dc(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function fc(e, t) {
    var n = dc(e);
    e = 0;
    for (var s; n; ) {
      if (n.nodeType === 3) {
        if (((s = e + n.textContent.length), e <= t && s >= t))
          return { node: n, offset: t - e };
        e = s;
      }
      e: {
        for (; n; ) {
          if (n.nextSibling) {
            n = n.nextSibling;
            break e;
          }
          n = n.parentNode;
        }
        n = void 0;
      }
      n = dc(n);
    }
  }
  function hc(e, t) {
    return e && t
      ? e === t
        ? !0
        : e && e.nodeType === 3
          ? !1
          : t && t.nodeType === 3
            ? hc(e, t.parentNode)
            : "contains" in e
              ? e.contains(t)
              : e.compareDocumentPosition
                ? !!(e.compareDocumentPosition(t) & 16)
                : !1
      : !1;
  }
  function pc() {
    for (var e = window, t = Pi(); t instanceof e.HTMLIFrameElement; ) {
      try {
        var n = typeof t.contentWindow.location.href == "string";
      } catch {
        n = !1;
      }
      if (n) e = t.contentWindow;
      else break;
      t = Pi(e.document);
    }
    return t;
  }
  function Ul(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return (
      t &&
      ((t === "input" &&
        (e.type === "text" ||
          e.type === "search" ||
          e.type === "tel" ||
          e.type === "url" ||
          e.type === "password")) ||
        t === "textarea" ||
        e.contentEditable === "true")
    );
  }
  function Tg(e) {
    var t = pc(),
      n = e.focusedElem,
      s = e.selectionRange;
    if (
      t !== n &&
      n &&
      n.ownerDocument &&
      hc(n.ownerDocument.documentElement, n)
    ) {
      if (s !== null && Ul(n)) {
        if (
          ((t = s.start),
          (e = s.end),
          e === void 0 && (e = t),
          "selectionStart" in n)
        )
          (n.selectionStart = t),
            (n.selectionEnd = Math.min(e, n.value.length));
        else if (
          ((e = ((t = n.ownerDocument || document) && t.defaultView) || window),
          e.getSelection)
        ) {
          e = e.getSelection();
          var o = n.textContent.length,
            a = Math.min(s.start, o);
          (s = s.end === void 0 ? a : Math.min(s.end, o)),
            !e.extend && a > s && ((o = s), (s = a), (a = o)),
            (o = fc(n, a));
          var d = fc(n, s);
          o &&
            d &&
            (e.rangeCount !== 1 ||
              e.anchorNode !== o.node ||
              e.anchorOffset !== o.offset ||
              e.focusNode !== d.node ||
              e.focusOffset !== d.offset) &&
            ((t = t.createRange()),
            t.setStart(o.node, o.offset),
            e.removeAllRanges(),
            a > s
              ? (e.addRange(t), e.extend(d.node, d.offset))
              : (t.setEnd(d.node, d.offset), e.addRange(t)));
        }
      }
      for (t = [], e = n; (e = e.parentNode); )
        e.nodeType === 1 &&
          t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
      for (typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++)
        (e = t[n]),
          (e.element.scrollLeft = e.left),
          (e.element.scrollTop = e.top);
    }
  }
  var Rg = g && "documentMode" in document && 11 >= document.documentMode,
    Kn = null,
    Gl = null,
    Wr = null,
    zl = !1;
  function mc(e, t, n) {
    var s =
      n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
    zl ||
      Kn == null ||
      Kn !== Pi(s) ||
      ((s = Kn),
      "selectionStart" in s && Ul(s)
        ? (s = { start: s.selectionStart, end: s.selectionEnd })
        : ((s = (
            (s.ownerDocument && s.ownerDocument.defaultView) ||
            window
          ).getSelection()),
          (s = {
            anchorNode: s.anchorNode,
            anchorOffset: s.anchorOffset,
            focusNode: s.focusNode,
            focusOffset: s.focusOffset,
          })),
      (Wr && br(Wr, s)) ||
        ((Wr = s),
        (s = qi(Gl, "onSelect")),
        0 < s.length &&
          ((t = new Pl("onSelect", "select", null, t, n)),
          e.push({ event: t, listeners: s }),
          (t.target = Kn))));
  }
  function Ki(e, t) {
    var n = {};
    return (
      (n[e.toLowerCase()] = t.toLowerCase()),
      (n["Webkit" + e] = "webkit" + t),
      (n["Moz" + e] = "moz" + t),
      n
    );
  }
  var Qn = {
      animationend: Ki("Animation", "AnimationEnd"),
      animationiteration: Ki("Animation", "AnimationIteration"),
      animationstart: Ki("Animation", "AnimationStart"),
      transitionend: Ki("Transition", "TransitionEnd"),
    },
    bl = {},
    gc = {};
  g &&
    ((gc = document.createElement("div").style),
    "AnimationEvent" in window ||
      (delete Qn.animationend.animation,
      delete Qn.animationiteration.animation,
      delete Qn.animationstart.animation),
    "TransitionEvent" in window || delete Qn.transitionend.transition);
  function Qi(e) {
    if (bl[e]) return bl[e];
    if (!Qn[e]) return e;
    var t = Qn[e],
      n;
    for (n in t) if (t.hasOwnProperty(n) && n in gc) return (bl[e] = t[n]);
    return e;
  }
  var vc = Qi("animationend"),
    yc = Qi("animationiteration"),
    Sc = Qi("animationstart"),
    _c = Qi("transitionend"),
    Ec = new Map(),
    wc =
      "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
        " ",
      );
  function tn(e, t) {
    Ec.set(e, t), f(t, [e]);
  }
  for (var Wl = 0; Wl < wc.length; Wl++) {
    var Yl = wc[Wl],
      Lg = Yl.toLowerCase(),
      Ng = Yl[0].toUpperCase() + Yl.slice(1);
    tn(Lg, "on" + Ng);
  }
  tn(vc, "onAnimationEnd"),
    tn(yc, "onAnimationIteration"),
    tn(Sc, "onAnimationStart"),
    tn("dblclick", "onDoubleClick"),
    tn("focusin", "onFocus"),
    tn("focusout", "onBlur"),
    tn(_c, "onTransitionEnd"),
    h("onMouseEnter", ["mouseout", "mouseover"]),
    h("onMouseLeave", ["mouseout", "mouseover"]),
    h("onPointerEnter", ["pointerout", "pointerover"]),
    h("onPointerLeave", ["pointerout", "pointerover"]),
    f(
      "onChange",
      "change click focusin focusout input keydown keyup selectionchange".split(
        " ",
      ),
    ),
    f(
      "onSelect",
      "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
        " ",
      ),
    ),
    f("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]),
    f(
      "onCompositionEnd",
      "compositionend focusout keydown keypress keyup mousedown".split(" "),
    ),
    f(
      "onCompositionStart",
      "compositionstart focusout keydown keypress keyup mousedown".split(" "),
    ),
    f(
      "onCompositionUpdate",
      "compositionupdate focusout keydown keypress keyup mousedown".split(" "),
    );
  var Yr =
      "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
        " ",
      ),
    Og = new Set(
      "cancel close invalid load scroll toggle".split(" ").concat(Yr),
    );
  function Cc(e, t, n) {
    var s = e.type || "unknown-event";
    (e.currentTarget = n), Lm(s, t, void 0, e), (e.currentTarget = null);
  }
  function kc(e, t) {
    t = (t & 4) !== 0;
    for (var n = 0; n < e.length; n++) {
      var s = e[n],
        o = s.event;
      s = s.listeners;
      e: {
        var a = void 0;
        if (t)
          for (var d = s.length - 1; 0 <= d; d--) {
            var p = s[d],
              m = p.instance,
              C = p.currentTarget;
            if (((p = p.listener), m !== a && o.isPropagationStopped()))
              break e;
            Cc(o, p, C), (a = m);
          }
        else
          for (d = 0; d < s.length; d++) {
            if (
              ((p = s[d]),
              (m = p.instance),
              (C = p.currentTarget),
              (p = p.listener),
              m !== a && o.isPropagationStopped())
            )
              break e;
            Cc(o, p, C), (a = m);
          }
      }
    }
    if (Di) throw ((e = El), (Di = !1), (El = null), e);
  }
  function he(e, t) {
    var n = t[ql];
    n === void 0 && (n = t[ql] = new Set());
    var s = e + "__bubble";
    n.has(s) || (Ac(t, e, 2, !1), n.add(s));
  }
  function jl(e, t, n) {
    var s = 0;
    t && (s |= 4), Ac(n, e, s, t);
  }
  var Zi = "_reactListening" + Math.random().toString(36).slice(2);
  function jr(e) {
    if (!e[Zi]) {
      (e[Zi] = !0),
        u.forEach(function (n) {
          n !== "selectionchange" && (Og.has(n) || jl(n, !1, e), jl(n, !0, e));
        });
      var t = e.nodeType === 9 ? e : e.ownerDocument;
      t === null || t[Zi] || ((t[Zi] = !0), jl("selectionchange", !1, t));
    }
  }
  function Ac(e, t, n, s) {
    switch (Xu(t)) {
      case 1:
        var o = Ym;
        break;
      case 4:
        o = jm;
        break;
      default:
        o = Ll;
    }
    (n = o.bind(null, t, n, e)),
      (o = void 0),
      !_l ||
        (t !== "touchstart" && t !== "touchmove" && t !== "wheel") ||
        (o = !0),
      s
        ? o !== void 0
          ? e.addEventListener(t, n, { capture: !0, passive: o })
          : e.addEventListener(t, n, !0)
        : o !== void 0
          ? e.addEventListener(t, n, { passive: o })
          : e.addEventListener(t, n, !1);
  }
  function Vl(e, t, n, s, o) {
    var a = s;
    if ((t & 1) === 0 && (t & 2) === 0 && s !== null)
      e: for (;;) {
        if (s === null) return;
        var d = s.tag;
        if (d === 3 || d === 4) {
          var p = s.stateNode.containerInfo;
          if (p === o || (p.nodeType === 8 && p.parentNode === o)) break;
          if (d === 4)
            for (d = s.return; d !== null; ) {
              var m = d.tag;
              if (
                (m === 3 || m === 4) &&
                ((m = d.stateNode.containerInfo),
                m === o || (m.nodeType === 8 && m.parentNode === o))
              )
                return;
              d = d.return;
            }
          for (; p !== null; ) {
            if (((d = wn(p)), d === null)) return;
            if (((m = d.tag), m === 5 || m === 6)) {
              s = a = d;
              continue e;
            }
            p = p.parentNode;
          }
        }
        s = s.return;
      }
    Ou(function () {
      var C = a,
        T = vl(n),
        N = [];
      e: {
        var k = Ec.get(e);
        if (k !== void 0) {
          var B = Pl,
            H = e;
          switch (e) {
            case "keypress":
              if (ji(n) === 0) break e;
            case "keydown":
            case "keyup":
              B = lg;
              break;
            case "focusin":
              (H = "focus"), (B = Dl);
              break;
            case "focusout":
              (H = "blur"), (B = Dl);
              break;
            case "beforeblur":
            case "afterblur":
              B = Dl;
              break;
            case "click":
              if (n.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              B = Zu;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              B = Xm;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              B = ug;
              break;
            case vc:
            case yc:
            case Sc:
              B = Zm;
              break;
            case _c:
              B = dg;
              break;
            case "scroll":
              B = Vm;
              break;
            case "wheel":
              B = hg;
              break;
            case "copy":
            case "cut":
            case "paste":
              B = Jm;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              B = Ju;
          }
          var U = (t & 4) !== 0,
            Ce = !U && e === "scroll",
            S = U ? (k !== null ? k + "Capture" : null) : k;
          U = [];
          for (var v = C, E; v !== null; ) {
            E = v;
            var I = E.stateNode;
            if (
              (E.tag === 5 &&
                I !== null &&
                ((E = I),
                S !== null &&
                  ((I = Rr(v, S)), I != null && U.push(Vr(v, I, E)))),
              Ce)
            )
              break;
            v = v.return;
          }
          0 < U.length &&
            ((k = new B(k, H, null, n, T)), N.push({ event: k, listeners: U }));
        }
      }
      if ((t & 7) === 0) {
        e: {
          if (
            ((k = e === "mouseover" || e === "pointerover"),
            (B = e === "mouseout" || e === "pointerout"),
            k &&
              n !== gl &&
              (H = n.relatedTarget || n.fromElement) &&
              (wn(H) || H[xt]))
          )
            break e;
          if (
            (B || k) &&
            ((k =
              T.window === T
                ? T
                : (k = T.ownerDocument)
                  ? k.defaultView || k.parentWindow
                  : window),
            B
              ? ((H = n.relatedTarget || n.toElement),
                (B = C),
                (H = H ? wn(H) : null),
                H !== null &&
                  ((Ce = En(H)), H !== Ce || (H.tag !== 5 && H.tag !== 6)) &&
                  (H = null))
              : ((B = null), (H = C)),
            B !== H)
          ) {
            if (
              ((U = Zu),
              (I = "onMouseLeave"),
              (S = "onMouseEnter"),
              (v = "mouse"),
              (e === "pointerout" || e === "pointerover") &&
                ((U = Ju),
                (I = "onPointerLeave"),
                (S = "onPointerEnter"),
                (v = "pointer")),
              (Ce = B == null ? k : Jn(B)),
              (E = H == null ? k : Jn(H)),
              (k = new U(I, v + "leave", B, n, T)),
              (k.target = Ce),
              (k.relatedTarget = E),
              (I = null),
              wn(T) === C &&
                ((U = new U(S, v + "enter", H, n, T)),
                (U.target = E),
                (U.relatedTarget = Ce),
                (I = U)),
              (Ce = I),
              B && H)
            )
              t: {
                for (U = B, S = H, v = 0, E = U; E; E = Zn(E)) v++;
                for (E = 0, I = S; I; I = Zn(I)) E++;
                for (; 0 < v - E; ) (U = Zn(U)), v--;
                for (; 0 < E - v; ) (S = Zn(S)), E--;
                for (; v--; ) {
                  if (U === S || (S !== null && U === S.alternate)) break t;
                  (U = Zn(U)), (S = Zn(S));
                }
                U = null;
              }
            else U = null;
            B !== null && Tc(N, k, B, U, !1),
              H !== null && Ce !== null && Tc(N, Ce, H, U, !0);
          }
        }
        e: {
          if (
            ((k = C ? Jn(C) : window),
            (B = k.nodeName && k.nodeName.toLowerCase()),
            B === "select" || (B === "input" && k.type === "file"))
          )
            var G = _g;
          else if (sc(k))
            if (oc) G = kg;
            else {
              G = wg;
              var W = Eg;
            }
          else
            (B = k.nodeName) &&
              B.toLowerCase() === "input" &&
              (k.type === "checkbox" || k.type === "radio") &&
              (G = Cg);
          if (G && (G = G(e, C))) {
            lc(N, G, n, T);
            break e;
          }
          W && W(e, k, C),
            e === "focusout" &&
              (W = k._wrapperState) &&
              W.controlled &&
              k.type === "number" &&
              dl(k, "number", k.value);
        }
        switch (((W = C ? Jn(C) : window), e)) {
          case "focusin":
            (sc(W) || W.contentEditable === "true") &&
              ((Kn = W), (Gl = C), (Wr = null));
            break;
          case "focusout":
            Wr = Gl = Kn = null;
            break;
          case "mousedown":
            zl = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            (zl = !1), mc(N, n, T);
            break;
          case "selectionchange":
            if (Rg) break;
          case "keydown":
          case "keyup":
            mc(N, n, T);
        }
        var Y;
        if (xl)
          e: {
            switch (e) {
              case "compositionstart":
                var V = "onCompositionStart";
                break e;
              case "compositionend":
                V = "onCompositionEnd";
                break e;
              case "compositionupdate":
                V = "onCompositionUpdate";
                break e;
            }
            V = void 0;
          }
        else
          Xn
            ? rc(e, n) && (V = "onCompositionEnd")
            : e === "keydown" &&
              n.keyCode === 229 &&
              (V = "onCompositionStart");
        V &&
          (ec &&
            n.locale !== "ko" &&
            (Xn || V !== "onCompositionStart"
              ? V === "onCompositionEnd" && Xn && (Y = Ku())
              : ((en = T),
                (Ol = "value" in en ? en.value : en.textContent),
                (Xn = !0))),
          (W = qi(C, V)),
          0 < W.length &&
            ((V = new qu(V, e, null, n, T)),
            N.push({ event: V, listeners: W }),
            Y ? (V.data = Y) : ((Y = ic(n)), Y !== null && (V.data = Y)))),
          (Y = mg ? gg(e, n) : vg(e, n)) &&
            ((C = qi(C, "onBeforeInput")),
            0 < C.length &&
              ((T = new qu("onBeforeInput", "beforeinput", null, n, T)),
              N.push({ event: T, listeners: C }),
              (T.data = Y)));
      }
      kc(N, t);
    });
  }
  function Vr(e, t, n) {
    return { instance: e, listener: t, currentTarget: n };
  }
  function qi(e, t) {
    for (var n = t + "Capture", s = []; e !== null; ) {
      var o = e,
        a = o.stateNode;
      o.tag === 5 &&
        a !== null &&
        ((o = a),
        (a = Rr(e, n)),
        a != null && s.unshift(Vr(e, a, o)),
        (a = Rr(e, t)),
        a != null && s.push(Vr(e, a, o))),
        (e = e.return);
    }
    return s;
  }
  function Zn(e) {
    if (e === null) return null;
    do e = e.return;
    while (e && e.tag !== 5);
    return e || null;
  }
  function Tc(e, t, n, s, o) {
    for (var a = t._reactName, d = []; n !== null && n !== s; ) {
      var p = n,
        m = p.alternate,
        C = p.stateNode;
      if (m !== null && m === s) break;
      p.tag === 5 &&
        C !== null &&
        ((p = C),
        o
          ? ((m = Rr(n, a)), m != null && d.unshift(Vr(n, m, p)))
          : o || ((m = Rr(n, a)), m != null && d.push(Vr(n, m, p)))),
        (n = n.return);
    }
    d.length !== 0 && e.push({ event: t, listeners: d });
  }
  var Pg = /\r\n?/g,
    Ig = /\u0000|\uFFFD/g;
  function Rc(e) {
    return (typeof e == "string" ? e : "" + e)
      .replace(
        Pg,
        `
`,
      )
      .replace(Ig, "");
  }
  function Ji(e, t, n) {
    if (((t = Rc(t)), Rc(e) !== t && n)) throw Error(l(425));
  }
  function es() {}
  var $l = null,
    Xl = null;
  function Kl(e, t) {
    return (
      e === "textarea" ||
      e === "noscript" ||
      typeof t.children == "string" ||
      typeof t.children == "number" ||
      (typeof t.dangerouslySetInnerHTML == "object" &&
        t.dangerouslySetInnerHTML !== null &&
        t.dangerouslySetInnerHTML.__html != null)
    );
  }
  var Ql = typeof setTimeout == "function" ? setTimeout : void 0,
    Mg = typeof clearTimeout == "function" ? clearTimeout : void 0,
    Lc = typeof Promise == "function" ? Promise : void 0,
    Dg =
      typeof queueMicrotask == "function"
        ? queueMicrotask
        : typeof Lc < "u"
          ? function (e) {
              return Lc.resolve(null).then(e).catch(Bg);
            }
          : Ql;
  function Bg(e) {
    setTimeout(function () {
      throw e;
    });
  }
  function Zl(e, t) {
    var n = t,
      s = 0;
    do {
      var o = n.nextSibling;
      if ((e.removeChild(n), o && o.nodeType === 8))
        if (((n = o.data), n === "/$")) {
          if (s === 0) {
            e.removeChild(o), xr(t);
            return;
          }
          s--;
        } else (n !== "$" && n !== "$?" && n !== "$!") || s++;
      n = o;
    } while (n);
    xr(t);
  }
  function nn(e) {
    for (; e != null; e = e.nextSibling) {
      var t = e.nodeType;
      if (t === 1 || t === 3) break;
      if (t === 8) {
        if (((t = e.data), t === "$" || t === "$!" || t === "$?")) break;
        if (t === "/$") return null;
      }
    }
    return e;
  }
  function Nc(e) {
    e = e.previousSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var n = e.data;
        if (n === "$" || n === "$!" || n === "$?") {
          if (t === 0) return e;
          t--;
        } else n === "/$" && t++;
      }
      e = e.previousSibling;
    }
    return null;
  }
  var qn = Math.random().toString(36).slice(2),
    Lt = "__reactFiber$" + qn,
    $r = "__reactProps$" + qn,
    xt = "__reactContainer$" + qn,
    ql = "__reactEvents$" + qn,
    xg = "__reactListeners$" + qn,
    Fg = "__reactHandles$" + qn;
  function wn(e) {
    var t = e[Lt];
    if (t) return t;
    for (var n = e.parentNode; n; ) {
      if ((t = n[xt] || n[Lt])) {
        if (
          ((n = t.alternate),
          t.child !== null || (n !== null && n.child !== null))
        )
          for (e = Nc(e); e !== null; ) {
            if ((n = e[Lt])) return n;
            e = Nc(e);
          }
        return t;
      }
      (e = n), (n = e.parentNode);
    }
    return null;
  }
  function Xr(e) {
    return (
      (e = e[Lt] || e[xt]),
      !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3)
        ? null
        : e
    );
  }
  function Jn(e) {
    if (e.tag === 5 || e.tag === 6) return e.stateNode;
    throw Error(l(33));
  }
  function ts(e) {
    return e[$r] || null;
  }
  var Jl = [],
    er = -1;
  function rn(e) {
    return { current: e };
  }
  function pe(e) {
    0 > er || ((e.current = Jl[er]), (Jl[er] = null), er--);
  }
  function de(e, t) {
    er++, (Jl[er] = e.current), (e.current = t);
  }
  var sn = {},
    xe = rn(sn),
    Ve = rn(!1),
    Cn = sn;
  function tr(e, t) {
    var n = e.type.contextTypes;
    if (!n) return sn;
    var s = e.stateNode;
    if (s && s.__reactInternalMemoizedUnmaskedChildContext === t)
      return s.__reactInternalMemoizedMaskedChildContext;
    var o = {},
      a;
    for (a in n) o[a] = t[a];
    return (
      s &&
        ((e = e.stateNode),
        (e.__reactInternalMemoizedUnmaskedChildContext = t),
        (e.__reactInternalMemoizedMaskedChildContext = o)),
      o
    );
  }
  function $e(e) {
    return (e = e.childContextTypes), e != null;
  }
  function ns() {
    pe(Ve), pe(xe);
  }
  function Oc(e, t, n) {
    if (xe.current !== sn) throw Error(l(168));
    de(xe, t), de(Ve, n);
  }
  function Pc(e, t, n) {
    var s = e.stateNode;
    if (((t = t.childContextTypes), typeof s.getChildContext != "function"))
      return n;
    s = s.getChildContext();
    for (var o in s) if (!(o in t)) throw Error(l(108, ce(e) || "Unknown", o));
    return F({}, n, s);
  }
  function rs(e) {
    return (
      (e =
        ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) ||
        sn),
      (Cn = xe.current),
      de(xe, e),
      de(Ve, Ve.current),
      !0
    );
  }
  function Ic(e, t, n) {
    var s = e.stateNode;
    if (!s) throw Error(l(169));
    n
      ? ((e = Pc(e, t, Cn)),
        (s.__reactInternalMemoizedMergedChildContext = e),
        pe(Ve),
        pe(xe),
        de(xe, e))
      : pe(Ve),
      de(Ve, n);
  }
  var Ft = null,
    is = !1,
    eo = !1;
  function Mc(e) {
    Ft === null ? (Ft = [e]) : Ft.push(e);
  }
  function Hg(e) {
    (is = !0), Mc(e);
  }
  function ln() {
    if (!eo && Ft !== null) {
      eo = !0;
      var e = 0,
        t = oe;
      try {
        var n = Ft;
        for (oe = 1; e < n.length; e++) {
          var s = n[e];
          do s = s(!0);
          while (s !== null);
        }
        (Ft = null), (is = !1);
      } catch (o) {
        throw (Ft !== null && (Ft = Ft.slice(e + 1)), Bu(wl, ln), o);
      } finally {
        (oe = t), (eo = !1);
      }
    }
    return null;
  }
  var nr = [],
    rr = 0,
    ss = null,
    ls = 0,
    ut = [],
    ct = 0,
    kn = null,
    Ht = 1,
    Ut = "";
  function An(e, t) {
    (nr[rr++] = ls), (nr[rr++] = ss), (ss = e), (ls = t);
  }
  function Dc(e, t, n) {
    (ut[ct++] = Ht), (ut[ct++] = Ut), (ut[ct++] = kn), (kn = e);
    var s = Ht;
    e = Ut;
    var o = 32 - vt(s) - 1;
    (s &= ~(1 << o)), (n += 1);
    var a = 32 - vt(t) + o;
    if (30 < a) {
      var d = o - (o % 5);
      (a = (s & ((1 << d) - 1)).toString(32)),
        (s >>= d),
        (o -= d),
        (Ht = (1 << (32 - vt(t) + o)) | (n << o) | s),
        (Ut = a + e);
    } else (Ht = (1 << a) | (n << o) | s), (Ut = e);
  }
  function to(e) {
    e.return !== null && (An(e, 1), Dc(e, 1, 0));
  }
  function no(e) {
    for (; e === ss; )
      (ss = nr[--rr]), (nr[rr] = null), (ls = nr[--rr]), (nr[rr] = null);
    for (; e === kn; )
      (kn = ut[--ct]),
        (ut[ct] = null),
        (Ut = ut[--ct]),
        (ut[ct] = null),
        (Ht = ut[--ct]),
        (ut[ct] = null);
  }
  var rt = null,
    it = null,
    ge = !1,
    St = null;
  function Bc(e, t) {
    var n = pt(5, null, null, 0);
    (n.elementType = "DELETED"),
      (n.stateNode = t),
      (n.return = e),
      (t = e.deletions),
      t === null ? ((e.deletions = [n]), (e.flags |= 16)) : t.push(n);
  }
  function xc(e, t) {
    switch (e.tag) {
      case 5:
        var n = e.type;
        return (
          (t =
            t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase()
              ? null
              : t),
          t !== null
            ? ((e.stateNode = t), (rt = e), (it = nn(t.firstChild)), !0)
            : !1
        );
      case 6:
        return (
          (t = e.pendingProps === "" || t.nodeType !== 3 ? null : t),
          t !== null ? ((e.stateNode = t), (rt = e), (it = null), !0) : !1
        );
      case 13:
        return (
          (t = t.nodeType !== 8 ? null : t),
          t !== null
            ? ((n = kn !== null ? { id: Ht, overflow: Ut } : null),
              (e.memoizedState = {
                dehydrated: t,
                treeContext: n,
                retryLane: 1073741824,
              }),
              (n = pt(18, null, null, 0)),
              (n.stateNode = t),
              (n.return = e),
              (e.child = n),
              (rt = e),
              (it = null),
              !0)
            : !1
        );
      default:
        return !1;
    }
  }
  function ro(e) {
    return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
  }
  function io(e) {
    if (ge) {
      var t = it;
      if (t) {
        var n = t;
        if (!xc(e, t)) {
          if (ro(e)) throw Error(l(418));
          t = nn(n.nextSibling);
          var s = rt;
          t && xc(e, t)
            ? Bc(s, n)
            : ((e.flags = (e.flags & -4097) | 2), (ge = !1), (rt = e));
        }
      } else {
        if (ro(e)) throw Error(l(418));
        (e.flags = (e.flags & -4097) | 2), (ge = !1), (rt = e);
      }
    }
  }
  function Fc(e) {
    for (
      e = e.return;
      e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13;

    )
      e = e.return;
    rt = e;
  }
  function os(e) {
    if (e !== rt) return !1;
    if (!ge) return Fc(e), (ge = !0), !1;
    var t;
    if (
      ((t = e.tag !== 3) &&
        !(t = e.tag !== 5) &&
        ((t = e.type),
        (t = t !== "head" && t !== "body" && !Kl(e.type, e.memoizedProps))),
      t && (t = it))
    ) {
      if (ro(e)) throw (Hc(), Error(l(418)));
      for (; t; ) Bc(e, t), (t = nn(t.nextSibling));
    }
    if ((Fc(e), e.tag === 13)) {
      if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
        throw Error(l(317));
      e: {
        for (e = e.nextSibling, t = 0; e; ) {
          if (e.nodeType === 8) {
            var n = e.data;
            if (n === "/$") {
              if (t === 0) {
                it = nn(e.nextSibling);
                break e;
              }
              t--;
            } else (n !== "$" && n !== "$!" && n !== "$?") || t++;
          }
          e = e.nextSibling;
        }
        it = null;
      }
    } else it = rt ? nn(e.stateNode.nextSibling) : null;
    return !0;
  }
  function Hc() {
    for (var e = it; e; ) e = nn(e.nextSibling);
  }
  function ir() {
    (it = rt = null), (ge = !1);
  }
  function so(e) {
    St === null ? (St = [e]) : St.push(e);
  }
  var Ug = se.ReactCurrentBatchConfig;
  function Kr(e, t, n) {
    if (
      ((e = n.ref),
      e !== null && typeof e != "function" && typeof e != "object")
    ) {
      if (n._owner) {
        if (((n = n._owner), n)) {
          if (n.tag !== 1) throw Error(l(309));
          var s = n.stateNode;
        }
        if (!s) throw Error(l(147, e));
        var o = s,
          a = "" + e;
        return t !== null &&
          t.ref !== null &&
          typeof t.ref == "function" &&
          t.ref._stringRef === a
          ? t.ref
          : ((t = function (d) {
              var p = o.refs;
              d === null ? delete p[a] : (p[a] = d);
            }),
            (t._stringRef = a),
            t);
      }
      if (typeof e != "string") throw Error(l(284));
      if (!n._owner) throw Error(l(290, e));
    }
    return e;
  }
  function as(e, t) {
    throw (
      ((e = Object.prototype.toString.call(t)),
      Error(
        l(
          31,
          e === "[object Object]"
            ? "object with keys {" + Object.keys(t).join(", ") + "}"
            : e,
        ),
      ))
    );
  }
  function Uc(e) {
    var t = e._init;
    return t(e._payload);
  }
  function Gc(e) {
    function t(S, v) {
      if (e) {
        var E = S.deletions;
        E === null ? ((S.deletions = [v]), (S.flags |= 16)) : E.push(v);
      }
    }
    function n(S, v) {
      if (!e) return null;
      for (; v !== null; ) t(S, v), (v = v.sibling);
      return null;
    }
    function s(S, v) {
      for (S = new Map(); v !== null; )
        v.key !== null ? S.set(v.key, v) : S.set(v.index, v), (v = v.sibling);
      return S;
    }
    function o(S, v) {
      return (S = pn(S, v)), (S.index = 0), (S.sibling = null), S;
    }
    function a(S, v, E) {
      return (
        (S.index = E),
        e
          ? ((E = S.alternate),
            E !== null
              ? ((E = E.index), E < v ? ((S.flags |= 2), v) : E)
              : ((S.flags |= 2), v))
          : ((S.flags |= 1048576), v)
      );
    }
    function d(S) {
      return e && S.alternate === null && (S.flags |= 2), S;
    }
    function p(S, v, E, I) {
      return v === null || v.tag !== 6
        ? ((v = Zo(E, S.mode, I)), (v.return = S), v)
        : ((v = o(v, E)), (v.return = S), v);
    }
    function m(S, v, E, I) {
      var G = E.type;
      return G === Ye
        ? T(S, v, E.props.children, I, E.key)
        : v !== null &&
            (v.elementType === G ||
              (typeof G == "object" &&
                G !== null &&
                G.$$typeof === je &&
                Uc(G) === v.type))
          ? ((I = o(v, E.props)), (I.ref = Kr(S, v, E)), (I.return = S), I)
          : ((I = Is(E.type, E.key, E.props, null, S.mode, I)),
            (I.ref = Kr(S, v, E)),
            (I.return = S),
            I);
    }
    function C(S, v, E, I) {
      return v === null ||
        v.tag !== 4 ||
        v.stateNode.containerInfo !== E.containerInfo ||
        v.stateNode.implementation !== E.implementation
        ? ((v = qo(E, S.mode, I)), (v.return = S), v)
        : ((v = o(v, E.children || [])), (v.return = S), v);
    }
    function T(S, v, E, I, G) {
      return v === null || v.tag !== 7
        ? ((v = Mn(E, S.mode, I, G)), (v.return = S), v)
        : ((v = o(v, E)), (v.return = S), v);
    }
    function N(S, v, E) {
      if ((typeof v == "string" && v !== "") || typeof v == "number")
        return (v = Zo("" + v, S.mode, E)), (v.return = S), v;
      if (typeof v == "object" && v !== null) {
        switch (v.$$typeof) {
          case Ae:
            return (
              (E = Is(v.type, v.key, v.props, null, S.mode, E)),
              (E.ref = Kr(S, null, v)),
              (E.return = S),
              E
            );
          case ze:
            return (v = qo(v, S.mode, E)), (v.return = S), v;
          case je:
            var I = v._init;
            return N(S, I(v._payload), E);
        }
        if (kr(v) || j(v))
          return (v = Mn(v, S.mode, E, null)), (v.return = S), v;
        as(S, v);
      }
      return null;
    }
    function k(S, v, E, I) {
      var G = v !== null ? v.key : null;
      if ((typeof E == "string" && E !== "") || typeof E == "number")
        return G !== null ? null : p(S, v, "" + E, I);
      if (typeof E == "object" && E !== null) {
        switch (E.$$typeof) {
          case Ae:
            return E.key === G ? m(S, v, E, I) : null;
          case ze:
            return E.key === G ? C(S, v, E, I) : null;
          case je:
            return (G = E._init), k(S, v, G(E._payload), I);
        }
        if (kr(E) || j(E)) return G !== null ? null : T(S, v, E, I, null);
        as(S, E);
      }
      return null;
    }
    function B(S, v, E, I, G) {
      if ((typeof I == "string" && I !== "") || typeof I == "number")
        return (S = S.get(E) || null), p(v, S, "" + I, G);
      if (typeof I == "object" && I !== null) {
        switch (I.$$typeof) {
          case Ae:
            return (
              (S = S.get(I.key === null ? E : I.key) || null), m(v, S, I, G)
            );
          case ze:
            return (
              (S = S.get(I.key === null ? E : I.key) || null), C(v, S, I, G)
            );
          case je:
            var W = I._init;
            return B(S, v, E, W(I._payload), G);
        }
        if (kr(I) || j(I)) return (S = S.get(E) || null), T(v, S, I, G, null);
        as(v, I);
      }
      return null;
    }
    function H(S, v, E, I) {
      for (
        var G = null, W = null, Y = v, V = (v = 0), Ie = null;
        Y !== null && V < E.length;
        V++
      ) {
        Y.index > V ? ((Ie = Y), (Y = null)) : (Ie = Y.sibling);
        var ie = k(S, Y, E[V], I);
        if (ie === null) {
          Y === null && (Y = Ie);
          break;
        }
        e && Y && ie.alternate === null && t(S, Y),
          (v = a(ie, v, V)),
          W === null ? (G = ie) : (W.sibling = ie),
          (W = ie),
          (Y = Ie);
      }
      if (V === E.length) return n(S, Y), ge && An(S, V), G;
      if (Y === null) {
        for (; V < E.length; V++)
          (Y = N(S, E[V], I)),
            Y !== null &&
              ((v = a(Y, v, V)),
              W === null ? (G = Y) : (W.sibling = Y),
              (W = Y));
        return ge && An(S, V), G;
      }
      for (Y = s(S, Y); V < E.length; V++)
        (Ie = B(Y, S, V, E[V], I)),
          Ie !== null &&
            (e &&
              Ie.alternate !== null &&
              Y.delete(Ie.key === null ? V : Ie.key),
            (v = a(Ie, v, V)),
            W === null ? (G = Ie) : (W.sibling = Ie),
            (W = Ie));
      return (
        e &&
          Y.forEach(function (mn) {
            return t(S, mn);
          }),
        ge && An(S, V),
        G
      );
    }
    function U(S, v, E, I) {
      var G = j(E);
      if (typeof G != "function") throw Error(l(150));
      if (((E = G.call(E)), E == null)) throw Error(l(151));
      for (
        var W = (G = null), Y = v, V = (v = 0), Ie = null, ie = E.next();
        Y !== null && !ie.done;
        V++, ie = E.next()
      ) {
        Y.index > V ? ((Ie = Y), (Y = null)) : (Ie = Y.sibling);
        var mn = k(S, Y, ie.value, I);
        if (mn === null) {
          Y === null && (Y = Ie);
          break;
        }
        e && Y && mn.alternate === null && t(S, Y),
          (v = a(mn, v, V)),
          W === null ? (G = mn) : (W.sibling = mn),
          (W = mn),
          (Y = Ie);
      }
      if (ie.done) return n(S, Y), ge && An(S, V), G;
      if (Y === null) {
        for (; !ie.done; V++, ie = E.next())
          (ie = N(S, ie.value, I)),
            ie !== null &&
              ((v = a(ie, v, V)),
              W === null ? (G = ie) : (W.sibling = ie),
              (W = ie));
        return ge && An(S, V), G;
      }
      for (Y = s(S, Y); !ie.done; V++, ie = E.next())
        (ie = B(Y, S, V, ie.value, I)),
          ie !== null &&
            (e &&
              ie.alternate !== null &&
              Y.delete(ie.key === null ? V : ie.key),
            (v = a(ie, v, V)),
            W === null ? (G = ie) : (W.sibling = ie),
            (W = ie));
      return (
        e &&
          Y.forEach(function (yv) {
            return t(S, yv);
          }),
        ge && An(S, V),
        G
      );
    }
    function Ce(S, v, E, I) {
      if (
        (typeof E == "object" &&
          E !== null &&
          E.type === Ye &&
          E.key === null &&
          (E = E.props.children),
        typeof E == "object" && E !== null)
      ) {
        switch (E.$$typeof) {
          case Ae:
            e: {
              for (var G = E.key, W = v; W !== null; ) {
                if (W.key === G) {
                  if (((G = E.type), G === Ye)) {
                    if (W.tag === 7) {
                      n(S, W.sibling),
                        (v = o(W, E.props.children)),
                        (v.return = S),
                        (S = v);
                      break e;
                    }
                  } else if (
                    W.elementType === G ||
                    (typeof G == "object" &&
                      G !== null &&
                      G.$$typeof === je &&
                      Uc(G) === W.type)
                  ) {
                    n(S, W.sibling),
                      (v = o(W, E.props)),
                      (v.ref = Kr(S, W, E)),
                      (v.return = S),
                      (S = v);
                    break e;
                  }
                  n(S, W);
                  break;
                } else t(S, W);
                W = W.sibling;
              }
              E.type === Ye
                ? ((v = Mn(E.props.children, S.mode, I, E.key)),
                  (v.return = S),
                  (S = v))
                : ((I = Is(E.type, E.key, E.props, null, S.mode, I)),
                  (I.ref = Kr(S, v, E)),
                  (I.return = S),
                  (S = I));
            }
            return d(S);
          case ze:
            e: {
              for (W = E.key; v !== null; ) {
                if (v.key === W)
                  if (
                    v.tag === 4 &&
                    v.stateNode.containerInfo === E.containerInfo &&
                    v.stateNode.implementation === E.implementation
                  ) {
                    n(S, v.sibling),
                      (v = o(v, E.children || [])),
                      (v.return = S),
                      (S = v);
                    break e;
                  } else {
                    n(S, v);
                    break;
                  }
                else t(S, v);
                v = v.sibling;
              }
              (v = qo(E, S.mode, I)), (v.return = S), (S = v);
            }
            return d(S);
          case je:
            return (W = E._init), Ce(S, v, W(E._payload), I);
        }
        if (kr(E)) return H(S, v, E, I);
        if (j(E)) return U(S, v, E, I);
        as(S, E);
      }
      return (typeof E == "string" && E !== "") || typeof E == "number"
        ? ((E = "" + E),
          v !== null && v.tag === 6
            ? (n(S, v.sibling), (v = o(v, E)), (v.return = S), (S = v))
            : (n(S, v), (v = Zo(E, S.mode, I)), (v.return = S), (S = v)),
          d(S))
        : n(S, v);
    }
    return Ce;
  }
  var sr = Gc(!0),
    zc = Gc(!1),
    us = rn(null),
    cs = null,
    lr = null,
    lo = null;
  function oo() {
    lo = lr = cs = null;
  }
  function ao(e) {
    var t = us.current;
    pe(us), (e._currentValue = t);
  }
  function uo(e, t, n) {
    for (; e !== null; ) {
      var s = e.alternate;
      if (
        ((e.childLanes & t) !== t
          ? ((e.childLanes |= t), s !== null && (s.childLanes |= t))
          : s !== null && (s.childLanes & t) !== t && (s.childLanes |= t),
        e === n)
      )
        break;
      e = e.return;
    }
  }
  function or(e, t) {
    (cs = e),
      (lo = lr = null),
      (e = e.dependencies),
      e !== null &&
        e.firstContext !== null &&
        ((e.lanes & t) !== 0 && (Xe = !0), (e.firstContext = null));
  }
  function dt(e) {
    var t = e._currentValue;
    if (lo !== e)
      if (((e = { context: e, memoizedValue: t, next: null }), lr === null)) {
        if (cs === null) throw Error(l(308));
        (lr = e), (cs.dependencies = { lanes: 0, firstContext: e });
      } else lr = lr.next = e;
    return t;
  }
  var Tn = null;
  function co(e) {
    Tn === null ? (Tn = [e]) : Tn.push(e);
  }
  function bc(e, t, n, s) {
    var o = t.interleaved;
    return (
      o === null ? ((n.next = n), co(t)) : ((n.next = o.next), (o.next = n)),
      (t.interleaved = n),
      Gt(e, s)
    );
  }
  function Gt(e, t) {
    e.lanes |= t;
    var n = e.alternate;
    for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; )
      (e.childLanes |= t),
        (n = e.alternate),
        n !== null && (n.childLanes |= t),
        (n = e),
        (e = e.return);
    return n.tag === 3 ? n.stateNode : null;
  }
  var on = !1;
  function fo(e) {
    e.updateQueue = {
      baseState: e.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, interleaved: null, lanes: 0 },
      effects: null,
    };
  }
  function Wc(e, t) {
    (e = e.updateQueue),
      t.updateQueue === e &&
        (t.updateQueue = {
          baseState: e.baseState,
          firstBaseUpdate: e.firstBaseUpdate,
          lastBaseUpdate: e.lastBaseUpdate,
          shared: e.shared,
          effects: e.effects,
        });
  }
  function zt(e, t) {
    return {
      eventTime: e,
      lane: t,
      tag: 0,
      payload: null,
      callback: null,
      next: null,
    };
  }
  function an(e, t, n) {
    var s = e.updateQueue;
    if (s === null) return null;
    if (((s = s.shared), (te & 2) !== 0)) {
      var o = s.pending;
      return (
        o === null ? (t.next = t) : ((t.next = o.next), (o.next = t)),
        (s.pending = t),
        Gt(e, n)
      );
    }
    return (
      (o = s.interleaved),
      o === null ? ((t.next = t), co(s)) : ((t.next = o.next), (o.next = t)),
      (s.interleaved = t),
      Gt(e, n)
    );
  }
  function ds(e, t, n) {
    if (
      ((t = t.updateQueue), t !== null && ((t = t.shared), (n & 4194240) !== 0))
    ) {
      var s = t.lanes;
      (s &= e.pendingLanes), (n |= s), (t.lanes = n), Al(e, n);
    }
  }
  function Yc(e, t) {
    var n = e.updateQueue,
      s = e.alternate;
    if (s !== null && ((s = s.updateQueue), n === s)) {
      var o = null,
        a = null;
      if (((n = n.firstBaseUpdate), n !== null)) {
        do {
          var d = {
            eventTime: n.eventTime,
            lane: n.lane,
            tag: n.tag,
            payload: n.payload,
            callback: n.callback,
            next: null,
          };
          a === null ? (o = a = d) : (a = a.next = d), (n = n.next);
        } while (n !== null);
        a === null ? (o = a = t) : (a = a.next = t);
      } else o = a = t;
      (n = {
        baseState: s.baseState,
        firstBaseUpdate: o,
        lastBaseUpdate: a,
        shared: s.shared,
        effects: s.effects,
      }),
        (e.updateQueue = n);
      return;
    }
    (e = n.lastBaseUpdate),
      e === null ? (n.firstBaseUpdate = t) : (e.next = t),
      (n.lastBaseUpdate = t);
  }
  function fs(e, t, n, s) {
    var o = e.updateQueue;
    on = !1;
    var a = o.firstBaseUpdate,
      d = o.lastBaseUpdate,
      p = o.shared.pending;
    if (p !== null) {
      o.shared.pending = null;
      var m = p,
        C = m.next;
      (m.next = null), d === null ? (a = C) : (d.next = C), (d = m);
      var T = e.alternate;
      T !== null &&
        ((T = T.updateQueue),
        (p = T.lastBaseUpdate),
        p !== d &&
          (p === null ? (T.firstBaseUpdate = C) : (p.next = C),
          (T.lastBaseUpdate = m)));
    }
    if (a !== null) {
      var N = o.baseState;
      (d = 0), (T = C = m = null), (p = a);
      do {
        var k = p.lane,
          B = p.eventTime;
        if ((s & k) === k) {
          T !== null &&
            (T = T.next =
              {
                eventTime: B,
                lane: 0,
                tag: p.tag,
                payload: p.payload,
                callback: p.callback,
                next: null,
              });
          e: {
            var H = e,
              U = p;
            switch (((k = t), (B = n), U.tag)) {
              case 1:
                if (((H = U.payload), typeof H == "function")) {
                  N = H.call(B, N, k);
                  break e;
                }
                N = H;
                break e;
              case 3:
                H.flags = (H.flags & -65537) | 128;
              case 0:
                if (
                  ((H = U.payload),
                  (k = typeof H == "function" ? H.call(B, N, k) : H),
                  k == null)
                )
                  break e;
                N = F({}, N, k);
                break e;
              case 2:
                on = !0;
            }
          }
          p.callback !== null &&
            p.lane !== 0 &&
            ((e.flags |= 64),
            (k = o.effects),
            k === null ? (o.effects = [p]) : k.push(p));
        } else
          (B = {
            eventTime: B,
            lane: k,
            tag: p.tag,
            payload: p.payload,
            callback: p.callback,
            next: null,
          }),
            T === null ? ((C = T = B), (m = N)) : (T = T.next = B),
            (d |= k);
        if (((p = p.next), p === null)) {
          if (((p = o.shared.pending), p === null)) break;
          (k = p),
            (p = k.next),
            (k.next = null),
            (o.lastBaseUpdate = k),
            (o.shared.pending = null);
        }
      } while (!0);
      if (
        (T === null && (m = N),
        (o.baseState = m),
        (o.firstBaseUpdate = C),
        (o.lastBaseUpdate = T),
        (t = o.shared.interleaved),
        t !== null)
      ) {
        o = t;
        do (d |= o.lane), (o = o.next);
        while (o !== t);
      } else a === null && (o.shared.lanes = 0);
      (Nn |= d), (e.lanes = d), (e.memoizedState = N);
    }
  }
  function jc(e, t, n) {
    if (((e = t.effects), (t.effects = null), e !== null))
      for (t = 0; t < e.length; t++) {
        var s = e[t],
          o = s.callback;
        if (o !== null) {
          if (((s.callback = null), (s = n), typeof o != "function"))
            throw Error(l(191, o));
          o.call(s);
        }
      }
  }
  var Qr = {},
    Nt = rn(Qr),
    Zr = rn(Qr),
    qr = rn(Qr);
  function Rn(e) {
    if (e === Qr) throw Error(l(174));
    return e;
  }
  function ho(e, t) {
    switch ((de(qr, t), de(Zr, e), de(Nt, Qr), (e = t.nodeType), e)) {
      case 9:
      case 11:
        t = (t = t.documentElement) ? t.namespaceURI : hl(null, "");
        break;
      default:
        (e = e === 8 ? t.parentNode : t),
          (t = e.namespaceURI || null),
          (e = e.tagName),
          (t = hl(t, e));
    }
    pe(Nt), de(Nt, t);
  }
  function ar() {
    pe(Nt), pe(Zr), pe(qr);
  }
  function Vc(e) {
    Rn(qr.current);
    var t = Rn(Nt.current),
      n = hl(t, e.type);
    t !== n && (de(Zr, e), de(Nt, n));
  }
  function po(e) {
    Zr.current === e && (pe(Nt), pe(Zr));
  }
  var ve = rn(0);
  function hs(e) {
    for (var t = e; t !== null; ) {
      if (t.tag === 13) {
        var n = t.memoizedState;
        if (
          n !== null &&
          ((n = n.dehydrated), n === null || n.data === "$?" || n.data === "$!")
        )
          return t;
      } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
        if ((t.flags & 128) !== 0) return t;
      } else if (t.child !== null) {
        (t.child.return = t), (t = t.child);
        continue;
      }
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return null;
        t = t.return;
      }
      (t.sibling.return = t.return), (t = t.sibling);
    }
    return null;
  }
  var mo = [];
  function go() {
    for (var e = 0; e < mo.length; e++)
      mo[e]._workInProgressVersionPrimary = null;
    mo.length = 0;
  }
  var ps = se.ReactCurrentDispatcher,
    vo = se.ReactCurrentBatchConfig,
    Ln = 0,
    ye = null,
    Te = null,
    Oe = null,
    ms = !1,
    Jr = !1,
    ei = 0,
    Gg = 0;
  function Fe() {
    throw Error(l(321));
  }
  function yo(e, t) {
    if (t === null) return !1;
    for (var n = 0; n < t.length && n < e.length; n++)
      if (!yt(e[n], t[n])) return !1;
    return !0;
  }
  function So(e, t, n, s, o, a) {
    if (
      ((Ln = a),
      (ye = t),
      (t.memoizedState = null),
      (t.updateQueue = null),
      (t.lanes = 0),
      (ps.current = e === null || e.memoizedState === null ? Yg : jg),
      (e = n(s, o)),
      Jr)
    ) {
      a = 0;
      do {
        if (((Jr = !1), (ei = 0), 25 <= a)) throw Error(l(301));
        (a += 1),
          (Oe = Te = null),
          (t.updateQueue = null),
          (ps.current = Vg),
          (e = n(s, o));
      } while (Jr);
    }
    if (
      ((ps.current = ys),
      (t = Te !== null && Te.next !== null),
      (Ln = 0),
      (Oe = Te = ye = null),
      (ms = !1),
      t)
    )
      throw Error(l(300));
    return e;
  }
  function _o() {
    var e = ei !== 0;
    return (ei = 0), e;
  }
  function Ot() {
    var e = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null,
    };
    return Oe === null ? (ye.memoizedState = Oe = e) : (Oe = Oe.next = e), Oe;
  }
  function ft() {
    if (Te === null) {
      var e = ye.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = Te.next;
    var t = Oe === null ? ye.memoizedState : Oe.next;
    if (t !== null) (Oe = t), (Te = e);
    else {
      if (e === null) throw Error(l(310));
      (Te = e),
        (e = {
          memoizedState: Te.memoizedState,
          baseState: Te.baseState,
          baseQueue: Te.baseQueue,
          queue: Te.queue,
          next: null,
        }),
        Oe === null ? (ye.memoizedState = Oe = e) : (Oe = Oe.next = e);
    }
    return Oe;
  }
  function ti(e, t) {
    return typeof t == "function" ? t(e) : t;
  }
  function Eo(e) {
    var t = ft(),
      n = t.queue;
    if (n === null) throw Error(l(311));
    n.lastRenderedReducer = e;
    var s = Te,
      o = s.baseQueue,
      a = n.pending;
    if (a !== null) {
      if (o !== null) {
        var d = o.next;
        (o.next = a.next), (a.next = d);
      }
      (s.baseQueue = o = a), (n.pending = null);
    }
    if (o !== null) {
      (a = o.next), (s = s.baseState);
      var p = (d = null),
        m = null,
        C = a;
      do {
        var T = C.lane;
        if ((Ln & T) === T)
          m !== null &&
            (m = m.next =
              {
                lane: 0,
                action: C.action,
                hasEagerState: C.hasEagerState,
                eagerState: C.eagerState,
                next: null,
              }),
            (s = C.hasEagerState ? C.eagerState : e(s, C.action));
        else {
          var N = {
            lane: T,
            action: C.action,
            hasEagerState: C.hasEagerState,
            eagerState: C.eagerState,
            next: null,
          };
          m === null ? ((p = m = N), (d = s)) : (m = m.next = N),
            (ye.lanes |= T),
            (Nn |= T);
        }
        C = C.next;
      } while (C !== null && C !== a);
      m === null ? (d = s) : (m.next = p),
        yt(s, t.memoizedState) || (Xe = !0),
        (t.memoizedState = s),
        (t.baseState = d),
        (t.baseQueue = m),
        (n.lastRenderedState = s);
    }
    if (((e = n.interleaved), e !== null)) {
      o = e;
      do (a = o.lane), (ye.lanes |= a), (Nn |= a), (o = o.next);
      while (o !== e);
    } else o === null && (n.lanes = 0);
    return [t.memoizedState, n.dispatch];
  }
  function wo(e) {
    var t = ft(),
      n = t.queue;
    if (n === null) throw Error(l(311));
    n.lastRenderedReducer = e;
    var s = n.dispatch,
      o = n.pending,
      a = t.memoizedState;
    if (o !== null) {
      n.pending = null;
      var d = (o = o.next);
      do (a = e(a, d.action)), (d = d.next);
      while (d !== o);
      yt(a, t.memoizedState) || (Xe = !0),
        (t.memoizedState = a),
        t.baseQueue === null && (t.baseState = a),
        (n.lastRenderedState = a);
    }
    return [a, s];
  }
  function $c() {}
  function Xc(e, t) {
    var n = ye,
      s = ft(),
      o = t(),
      a = !yt(s.memoizedState, o);
    if (
      (a && ((s.memoizedState = o), (Xe = !0)),
      (s = s.queue),
      Co(Zc.bind(null, n, s, e), [e]),
      s.getSnapshot !== t || a || (Oe !== null && Oe.memoizedState.tag & 1))
    ) {
      if (
        ((n.flags |= 2048),
        ni(9, Qc.bind(null, n, s, o, t), void 0, null),
        Pe === null)
      )
        throw Error(l(349));
      (Ln & 30) !== 0 || Kc(n, t, o);
    }
    return o;
  }
  function Kc(e, t, n) {
    (e.flags |= 16384),
      (e = { getSnapshot: t, value: n }),
      (t = ye.updateQueue),
      t === null
        ? ((t = { lastEffect: null, stores: null }),
          (ye.updateQueue = t),
          (t.stores = [e]))
        : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e));
  }
  function Qc(e, t, n, s) {
    (t.value = n), (t.getSnapshot = s), qc(t) && Jc(e);
  }
  function Zc(e, t, n) {
    return n(function () {
      qc(t) && Jc(e);
    });
  }
  function qc(e) {
    var t = e.getSnapshot;
    e = e.value;
    try {
      var n = t();
      return !yt(e, n);
    } catch {
      return !0;
    }
  }
  function Jc(e) {
    var t = Gt(e, 1);
    t !== null && Ct(t, e, 1, -1);
  }
  function ed(e) {
    var t = Ot();
    return (
      typeof e == "function" && (e = e()),
      (t.memoizedState = t.baseState = e),
      (e = {
        pending: null,
        interleaved: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: ti,
        lastRenderedState: e,
      }),
      (t.queue = e),
      (e = e.dispatch = Wg.bind(null, ye, e)),
      [t.memoizedState, e]
    );
  }
  function ni(e, t, n, s) {
    return (
      (e = { tag: e, create: t, destroy: n, deps: s, next: null }),
      (t = ye.updateQueue),
      t === null
        ? ((t = { lastEffect: null, stores: null }),
          (ye.updateQueue = t),
          (t.lastEffect = e.next = e))
        : ((n = t.lastEffect),
          n === null
            ? (t.lastEffect = e.next = e)
            : ((s = n.next), (n.next = e), (e.next = s), (t.lastEffect = e))),
      e
    );
  }
  function td() {
    return ft().memoizedState;
  }
  function gs(e, t, n, s) {
    var o = Ot();
    (ye.flags |= e),
      (o.memoizedState = ni(1 | t, n, void 0, s === void 0 ? null : s));
  }
  function vs(e, t, n, s) {
    var o = ft();
    s = s === void 0 ? null : s;
    var a = void 0;
    if (Te !== null) {
      var d = Te.memoizedState;
      if (((a = d.destroy), s !== null && yo(s, d.deps))) {
        o.memoizedState = ni(t, n, a, s);
        return;
      }
    }
    (ye.flags |= e), (o.memoizedState = ni(1 | t, n, a, s));
  }
  function nd(e, t) {
    return gs(8390656, 8, e, t);
  }
  function Co(e, t) {
    return vs(2048, 8, e, t);
  }
  function rd(e, t) {
    return vs(4, 2, e, t);
  }
  function id(e, t) {
    return vs(4, 4, e, t);
  }
  function sd(e, t) {
    if (typeof t == "function")
      return (
        (e = e()),
        t(e),
        function () {
          t(null);
        }
      );
    if (t != null)
      return (
        (e = e()),
        (t.current = e),
        function () {
          t.current = null;
        }
      );
  }
  function ld(e, t, n) {
    return (
      (n = n != null ? n.concat([e]) : null), vs(4, 4, sd.bind(null, t, e), n)
    );
  }
  function ko() {}
  function od(e, t) {
    var n = ft();
    t = t === void 0 ? null : t;
    var s = n.memoizedState;
    return s !== null && t !== null && yo(t, s[1])
      ? s[0]
      : ((n.memoizedState = [e, t]), e);
  }
  function ad(e, t) {
    var n = ft();
    t = t === void 0 ? null : t;
    var s = n.memoizedState;
    return s !== null && t !== null && yo(t, s[1])
      ? s[0]
      : ((e = e()), (n.memoizedState = [e, t]), e);
  }
  function ud(e, t, n) {
    return (Ln & 21) === 0
      ? (e.baseState && ((e.baseState = !1), (Xe = !0)), (e.memoizedState = n))
      : (yt(n, t) ||
          ((n = Uu()), (ye.lanes |= n), (Nn |= n), (e.baseState = !0)),
        t);
  }
  function zg(e, t) {
    var n = oe;
    (oe = n !== 0 && 4 > n ? n : 4), e(!0);
    var s = vo.transition;
    vo.transition = {};
    try {
      e(!1), t();
    } finally {
      (oe = n), (vo.transition = s);
    }
  }
  function cd() {
    return ft().memoizedState;
  }
  function bg(e, t, n) {
    var s = fn(e);
    if (
      ((n = {
        lane: s,
        action: n,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      }),
      dd(e))
    )
      fd(t, n);
    else if (((n = bc(e, t, n, s)), n !== null)) {
      var o = We();
      Ct(n, e, s, o), hd(n, t, s);
    }
  }
  function Wg(e, t, n) {
    var s = fn(e),
      o = {
        lane: s,
        action: n,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      };
    if (dd(e)) fd(t, o);
    else {
      var a = e.alternate;
      if (
        e.lanes === 0 &&
        (a === null || a.lanes === 0) &&
        ((a = t.lastRenderedReducer), a !== null)
      )
        try {
          var d = t.lastRenderedState,
            p = a(d, n);
          if (((o.hasEagerState = !0), (o.eagerState = p), yt(p, d))) {
            var m = t.interleaved;
            m === null
              ? ((o.next = o), co(t))
              : ((o.next = m.next), (m.next = o)),
              (t.interleaved = o);
            return;
          }
        } catch {}
      (n = bc(e, t, o, s)),
        n !== null && ((o = We()), Ct(n, e, s, o), hd(n, t, s));
    }
  }
  function dd(e) {
    var t = e.alternate;
    return e === ye || (t !== null && t === ye);
  }
  function fd(e, t) {
    Jr = ms = !0;
    var n = e.pending;
    n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)),
      (e.pending = t);
  }
  function hd(e, t, n) {
    if ((n & 4194240) !== 0) {
      var s = t.lanes;
      (s &= e.pendingLanes), (n |= s), (t.lanes = n), Al(e, n);
    }
  }
  var ys = {
      readContext: dt,
      useCallback: Fe,
      useContext: Fe,
      useEffect: Fe,
      useImperativeHandle: Fe,
      useInsertionEffect: Fe,
      useLayoutEffect: Fe,
      useMemo: Fe,
      useReducer: Fe,
      useRef: Fe,
      useState: Fe,
      useDebugValue: Fe,
      useDeferredValue: Fe,
      useTransition: Fe,
      useMutableSource: Fe,
      useSyncExternalStore: Fe,
      useId: Fe,
      unstable_isNewReconciler: !1,
    },
    Yg = {
      readContext: dt,
      useCallback: function (e, t) {
        return (Ot().memoizedState = [e, t === void 0 ? null : t]), e;
      },
      useContext: dt,
      useEffect: nd,
      useImperativeHandle: function (e, t, n) {
        return (
          (n = n != null ? n.concat([e]) : null),
          gs(4194308, 4, sd.bind(null, t, e), n)
        );
      },
      useLayoutEffect: function (e, t) {
        return gs(4194308, 4, e, t);
      },
      useInsertionEffect: function (e, t) {
        return gs(4, 2, e, t);
      },
      useMemo: function (e, t) {
        var n = Ot();
        return (
          (t = t === void 0 ? null : t),
          (e = e()),
          (n.memoizedState = [e, t]),
          e
        );
      },
      useReducer: function (e, t, n) {
        var s = Ot();
        return (
          (t = n !== void 0 ? n(t) : t),
          (s.memoizedState = s.baseState = t),
          (e = {
            pending: null,
            interleaved: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: e,
            lastRenderedState: t,
          }),
          (s.queue = e),
          (e = e.dispatch = bg.bind(null, ye, e)),
          [s.memoizedState, e]
        );
      },
      useRef: function (e) {
        var t = Ot();
        return (e = { current: e }), (t.memoizedState = e);
      },
      useState: ed,
      useDebugValue: ko,
      useDeferredValue: function (e) {
        return (Ot().memoizedState = e);
      },
      useTransition: function () {
        var e = ed(!1),
          t = e[0];
        return (e = zg.bind(null, e[1])), (Ot().memoizedState = e), [t, e];
      },
      useMutableSource: function () {},
      useSyncExternalStore: function (e, t, n) {
        var s = ye,
          o = Ot();
        if (ge) {
          if (n === void 0) throw Error(l(407));
          n = n();
        } else {
          if (((n = t()), Pe === null)) throw Error(l(349));
          (Ln & 30) !== 0 || Kc(s, t, n);
        }
        o.memoizedState = n;
        var a = { value: n, getSnapshot: t };
        return (
          (o.queue = a),
          nd(Zc.bind(null, s, a, e), [e]),
          (s.flags |= 2048),
          ni(9, Qc.bind(null, s, a, n, t), void 0, null),
          n
        );
      },
      useId: function () {
        var e = Ot(),
          t = Pe.identifierPrefix;
        if (ge) {
          var n = Ut,
            s = Ht;
          (n = (s & ~(1 << (32 - vt(s) - 1))).toString(32) + n),
            (t = ":" + t + "R" + n),
            (n = ei++),
            0 < n && (t += "H" + n.toString(32)),
            (t += ":");
        } else (n = Gg++), (t = ":" + t + "r" + n.toString(32) + ":");
        return (e.memoizedState = t);
      },
      unstable_isNewReconciler: !1,
    },
    jg = {
      readContext: dt,
      useCallback: od,
      useContext: dt,
      useEffect: Co,
      useImperativeHandle: ld,
      useInsertionEffect: rd,
      useLayoutEffect: id,
      useMemo: ad,
      useReducer: Eo,
      useRef: td,
      useState: function () {
        return Eo(ti);
      },
      useDebugValue: ko,
      useDeferredValue: function (e) {
        var t = ft();
        return ud(t, Te.memoizedState, e);
      },
      useTransition: function () {
        var e = Eo(ti)[0],
          t = ft().memoizedState;
        return [e, t];
      },
      useMutableSource: $c,
      useSyncExternalStore: Xc,
      useId: cd,
      unstable_isNewReconciler: !1,
    },
    Vg = {
      readContext: dt,
      useCallback: od,
      useContext: dt,
      useEffect: Co,
      useImperativeHandle: ld,
      useInsertionEffect: rd,
      useLayoutEffect: id,
      useMemo: ad,
      useReducer: wo,
      useRef: td,
      useState: function () {
        return wo(ti);
      },
      useDebugValue: ko,
      useDeferredValue: function (e) {
        var t = ft();
        return Te === null ? (t.memoizedState = e) : ud(t, Te.memoizedState, e);
      },
      useTransition: function () {
        var e = wo(ti)[0],
          t = ft().memoizedState;
        return [e, t];
      },
      useMutableSource: $c,
      useSyncExternalStore: Xc,
      useId: cd,
      unstable_isNewReconciler: !1,
    };
  function _t(e, t) {
    if (e && e.defaultProps) {
      (t = F({}, t)), (e = e.defaultProps);
      for (var n in e) t[n] === void 0 && (t[n] = e[n]);
      return t;
    }
    return t;
  }
  function Ao(e, t, n, s) {
    (t = e.memoizedState),
      (n = n(s, t)),
      (n = n == null ? t : F({}, t, n)),
      (e.memoizedState = n),
      e.lanes === 0 && (e.updateQueue.baseState = n);
  }
  var Ss = {
    isMounted: function (e) {
      return (e = e._reactInternals) ? En(e) === e : !1;
    },
    enqueueSetState: function (e, t, n) {
      e = e._reactInternals;
      var s = We(),
        o = fn(e),
        a = zt(s, o);
      (a.payload = t),
        n != null && (a.callback = n),
        (t = an(e, a, o)),
        t !== null && (Ct(t, e, o, s), ds(t, e, o));
    },
    enqueueReplaceState: function (e, t, n) {
      e = e._reactInternals;
      var s = We(),
        o = fn(e),
        a = zt(s, o);
      (a.tag = 1),
        (a.payload = t),
        n != null && (a.callback = n),
        (t = an(e, a, o)),
        t !== null && (Ct(t, e, o, s), ds(t, e, o));
    },
    enqueueForceUpdate: function (e, t) {
      e = e._reactInternals;
      var n = We(),
        s = fn(e),
        o = zt(n, s);
      (o.tag = 2),
        t != null && (o.callback = t),
        (t = an(e, o, s)),
        t !== null && (Ct(t, e, s, n), ds(t, e, s));
    },
  };
  function pd(e, t, n, s, o, a, d) {
    return (
      (e = e.stateNode),
      typeof e.shouldComponentUpdate == "function"
        ? e.shouldComponentUpdate(s, a, d)
        : t.prototype && t.prototype.isPureReactComponent
          ? !br(n, s) || !br(o, a)
          : !0
    );
  }
  function md(e, t, n) {
    var s = !1,
      o = sn,
      a = t.contextType;
    return (
      typeof a == "object" && a !== null
        ? (a = dt(a))
        : ((o = $e(t) ? Cn : xe.current),
          (s = t.contextTypes),
          (a = (s = s != null) ? tr(e, o) : sn)),
      (t = new t(n, a)),
      (e.memoizedState =
        t.state !== null && t.state !== void 0 ? t.state : null),
      (t.updater = Ss),
      (e.stateNode = t),
      (t._reactInternals = e),
      s &&
        ((e = e.stateNode),
        (e.__reactInternalMemoizedUnmaskedChildContext = o),
        (e.__reactInternalMemoizedMaskedChildContext = a)),
      t
    );
  }
  function gd(e, t, n, s) {
    (e = t.state),
      typeof t.componentWillReceiveProps == "function" &&
        t.componentWillReceiveProps(n, s),
      typeof t.UNSAFE_componentWillReceiveProps == "function" &&
        t.UNSAFE_componentWillReceiveProps(n, s),
      t.state !== e && Ss.enqueueReplaceState(t, t.state, null);
  }
  function To(e, t, n, s) {
    var o = e.stateNode;
    (o.props = n), (o.state = e.memoizedState), (o.refs = {}), fo(e);
    var a = t.contextType;
    typeof a == "object" && a !== null
      ? (o.context = dt(a))
      : ((a = $e(t) ? Cn : xe.current), (o.context = tr(e, a))),
      (o.state = e.memoizedState),
      (a = t.getDerivedStateFromProps),
      typeof a == "function" && (Ao(e, t, a, n), (o.state = e.memoizedState)),
      typeof t.getDerivedStateFromProps == "function" ||
        typeof o.getSnapshotBeforeUpdate == "function" ||
        (typeof o.UNSAFE_componentWillMount != "function" &&
          typeof o.componentWillMount != "function") ||
        ((t = o.state),
        typeof o.componentWillMount == "function" && o.componentWillMount(),
        typeof o.UNSAFE_componentWillMount == "function" &&
          o.UNSAFE_componentWillMount(),
        t !== o.state && Ss.enqueueReplaceState(o, o.state, null),
        fs(e, n, o, s),
        (o.state = e.memoizedState)),
      typeof o.componentDidMount == "function" && (e.flags |= 4194308);
  }
  function ur(e, t) {
    try {
      var n = "",
        s = t;
      do (n += ne(s)), (s = s.return);
      while (s);
      var o = n;
    } catch (a) {
      o =
        `
Error generating stack: ` +
        a.message +
        `
` +
        a.stack;
    }
    return { value: e, source: t, stack: o, digest: null };
  }
  function Ro(e, t, n) {
    return { value: e, source: null, stack: n ?? null, digest: t ?? null };
  }
  function Lo(e, t) {
    try {
      console.error(t.value);
    } catch (n) {
      setTimeout(function () {
        throw n;
      });
    }
  }
  var $g = typeof WeakMap == "function" ? WeakMap : Map;
  function vd(e, t, n) {
    (n = zt(-1, n)), (n.tag = 3), (n.payload = { element: null });
    var s = t.value;
    return (
      (n.callback = function () {
        Ts || ((Ts = !0), (Wo = s)), Lo(e, t);
      }),
      n
    );
  }
  function yd(e, t, n) {
    (n = zt(-1, n)), (n.tag = 3);
    var s = e.type.getDerivedStateFromError;
    if (typeof s == "function") {
      var o = t.value;
      (n.payload = function () {
        return s(o);
      }),
        (n.callback = function () {
          Lo(e, t);
        });
    }
    var a = e.stateNode;
    return (
      a !== null &&
        typeof a.componentDidCatch == "function" &&
        (n.callback = function () {
          Lo(e, t),
            typeof s != "function" &&
              (cn === null ? (cn = new Set([this])) : cn.add(this));
          var d = t.stack;
          this.componentDidCatch(t.value, {
            componentStack: d !== null ? d : "",
          });
        }),
      n
    );
  }
  function Sd(e, t, n) {
    var s = e.pingCache;
    if (s === null) {
      s = e.pingCache = new $g();
      var o = new Set();
      s.set(t, o);
    } else (o = s.get(t)), o === void 0 && ((o = new Set()), s.set(t, o));
    o.has(n) || (o.add(n), (e = ov.bind(null, e, t, n)), t.then(e, e));
  }
  function _d(e) {
    do {
      var t;
      if (
        ((t = e.tag === 13) &&
          ((t = e.memoizedState),
          (t = t !== null ? t.dehydrated !== null : !0)),
        t)
      )
        return e;
      e = e.return;
    } while (e !== null);
    return null;
  }
  function Ed(e, t, n, s, o) {
    return (e.mode & 1) === 0
      ? (e === t
          ? (e.flags |= 65536)
          : ((e.flags |= 128),
            (n.flags |= 131072),
            (n.flags &= -52805),
            n.tag === 1 &&
              (n.alternate === null
                ? (n.tag = 17)
                : ((t = zt(-1, 1)), (t.tag = 2), an(n, t, 1))),
            (n.lanes |= 1)),
        e)
      : ((e.flags |= 65536), (e.lanes = o), e);
  }
  var Xg = se.ReactCurrentOwner,
    Xe = !1;
  function be(e, t, n, s) {
    t.child = e === null ? zc(t, null, n, s) : sr(t, e.child, n, s);
  }
  function wd(e, t, n, s, o) {
    n = n.render;
    var a = t.ref;
    return (
      or(t, o),
      (s = So(e, t, n, s, a, o)),
      (n = _o()),
      e !== null && !Xe
        ? ((t.updateQueue = e.updateQueue),
          (t.flags &= -2053),
          (e.lanes &= ~o),
          bt(e, t, o))
        : (ge && n && to(t), (t.flags |= 1), be(e, t, s, o), t.child)
    );
  }
  function Cd(e, t, n, s, o) {
    if (e === null) {
      var a = n.type;
      return typeof a == "function" &&
        !Qo(a) &&
        a.defaultProps === void 0 &&
        n.compare === null &&
        n.defaultProps === void 0
        ? ((t.tag = 15), (t.type = a), kd(e, t, a, s, o))
        : ((e = Is(n.type, null, s, t, t.mode, o)),
          (e.ref = t.ref),
          (e.return = t),
          (t.child = e));
    }
    if (((a = e.child), (e.lanes & o) === 0)) {
      var d = a.memoizedProps;
      if (
        ((n = n.compare), (n = n !== null ? n : br), n(d, s) && e.ref === t.ref)
      )
        return bt(e, t, o);
    }
    return (
      (t.flags |= 1),
      (e = pn(a, s)),
      (e.ref = t.ref),
      (e.return = t),
      (t.child = e)
    );
  }
  function kd(e, t, n, s, o) {
    if (e !== null) {
      var a = e.memoizedProps;
      if (br(a, s) && e.ref === t.ref)
        if (((Xe = !1), (t.pendingProps = s = a), (e.lanes & o) !== 0))
          (e.flags & 131072) !== 0 && (Xe = !0);
        else return (t.lanes = e.lanes), bt(e, t, o);
    }
    return No(e, t, n, s, o);
  }
  function Ad(e, t, n) {
    var s = t.pendingProps,
      o = s.children,
      a = e !== null ? e.memoizedState : null;
    if (s.mode === "hidden")
      if ((t.mode & 1) === 0)
        (t.memoizedState = {
          baseLanes: 0,
          cachePool: null,
          transitions: null,
        }),
          de(dr, st),
          (st |= n);
      else {
        if ((n & 1073741824) === 0)
          return (
            (e = a !== null ? a.baseLanes | n : n),
            (t.lanes = t.childLanes = 1073741824),
            (t.memoizedState = {
              baseLanes: e,
              cachePool: null,
              transitions: null,
            }),
            (t.updateQueue = null),
            de(dr, st),
            (st |= e),
            null
          );
        (t.memoizedState = {
          baseLanes: 0,
          cachePool: null,
          transitions: null,
        }),
          (s = a !== null ? a.baseLanes : n),
          de(dr, st),
          (st |= s);
      }
    else
      a !== null ? ((s = a.baseLanes | n), (t.memoizedState = null)) : (s = n),
        de(dr, st),
        (st |= s);
    return be(e, t, o, n), t.child;
  }
  function Td(e, t) {
    var n = t.ref;
    ((e === null && n !== null) || (e !== null && e.ref !== n)) &&
      ((t.flags |= 512), (t.flags |= 2097152));
  }
  function No(e, t, n, s, o) {
    var a = $e(n) ? Cn : xe.current;
    return (
      (a = tr(t, a)),
      or(t, o),
      (n = So(e, t, n, s, a, o)),
      (s = _o()),
      e !== null && !Xe
        ? ((t.updateQueue = e.updateQueue),
          (t.flags &= -2053),
          (e.lanes &= ~o),
          bt(e, t, o))
        : (ge && s && to(t), (t.flags |= 1), be(e, t, n, o), t.child)
    );
  }
  function Rd(e, t, n, s, o) {
    if ($e(n)) {
      var a = !0;
      rs(t);
    } else a = !1;
    if ((or(t, o), t.stateNode === null))
      Es(e, t), md(t, n, s), To(t, n, s, o), (s = !0);
    else if (e === null) {
      var d = t.stateNode,
        p = t.memoizedProps;
      d.props = p;
      var m = d.context,
        C = n.contextType;
      typeof C == "object" && C !== null
        ? (C = dt(C))
        : ((C = $e(n) ? Cn : xe.current), (C = tr(t, C)));
      var T = n.getDerivedStateFromProps,
        N =
          typeof T == "function" ||
          typeof d.getSnapshotBeforeUpdate == "function";
      N ||
        (typeof d.UNSAFE_componentWillReceiveProps != "function" &&
          typeof d.componentWillReceiveProps != "function") ||
        ((p !== s || m !== C) && gd(t, d, s, C)),
        (on = !1);
      var k = t.memoizedState;
      (d.state = k),
        fs(t, s, d, o),
        (m = t.memoizedState),
        p !== s || k !== m || Ve.current || on
          ? (typeof T == "function" && (Ao(t, n, T, s), (m = t.memoizedState)),
            (p = on || pd(t, n, p, s, k, m, C))
              ? (N ||
                  (typeof d.UNSAFE_componentWillMount != "function" &&
                    typeof d.componentWillMount != "function") ||
                  (typeof d.componentWillMount == "function" &&
                    d.componentWillMount(),
                  typeof d.UNSAFE_componentWillMount == "function" &&
                    d.UNSAFE_componentWillMount()),
                typeof d.componentDidMount == "function" &&
                  (t.flags |= 4194308))
              : (typeof d.componentDidMount == "function" &&
                  (t.flags |= 4194308),
                (t.memoizedProps = s),
                (t.memoizedState = m)),
            (d.props = s),
            (d.state = m),
            (d.context = C),
            (s = p))
          : (typeof d.componentDidMount == "function" && (t.flags |= 4194308),
            (s = !1));
    } else {
      (d = t.stateNode),
        Wc(e, t),
        (p = t.memoizedProps),
        (C = t.type === t.elementType ? p : _t(t.type, p)),
        (d.props = C),
        (N = t.pendingProps),
        (k = d.context),
        (m = n.contextType),
        typeof m == "object" && m !== null
          ? (m = dt(m))
          : ((m = $e(n) ? Cn : xe.current), (m = tr(t, m)));
      var B = n.getDerivedStateFromProps;
      (T =
        typeof B == "function" ||
        typeof d.getSnapshotBeforeUpdate == "function") ||
        (typeof d.UNSAFE_componentWillReceiveProps != "function" &&
          typeof d.componentWillReceiveProps != "function") ||
        ((p !== N || k !== m) && gd(t, d, s, m)),
        (on = !1),
        (k = t.memoizedState),
        (d.state = k),
        fs(t, s, d, o);
      var H = t.memoizedState;
      p !== N || k !== H || Ve.current || on
        ? (typeof B == "function" && (Ao(t, n, B, s), (H = t.memoizedState)),
          (C = on || pd(t, n, C, s, k, H, m) || !1)
            ? (T ||
                (typeof d.UNSAFE_componentWillUpdate != "function" &&
                  typeof d.componentWillUpdate != "function") ||
                (typeof d.componentWillUpdate == "function" &&
                  d.componentWillUpdate(s, H, m),
                typeof d.UNSAFE_componentWillUpdate == "function" &&
                  d.UNSAFE_componentWillUpdate(s, H, m)),
              typeof d.componentDidUpdate == "function" && (t.flags |= 4),
              typeof d.getSnapshotBeforeUpdate == "function" &&
                (t.flags |= 1024))
            : (typeof d.componentDidUpdate != "function" ||
                (p === e.memoizedProps && k === e.memoizedState) ||
                (t.flags |= 4),
              typeof d.getSnapshotBeforeUpdate != "function" ||
                (p === e.memoizedProps && k === e.memoizedState) ||
                (t.flags |= 1024),
              (t.memoizedProps = s),
              (t.memoizedState = H)),
          (d.props = s),
          (d.state = H),
          (d.context = m),
          (s = C))
        : (typeof d.componentDidUpdate != "function" ||
            (p === e.memoizedProps && k === e.memoizedState) ||
            (t.flags |= 4),
          typeof d.getSnapshotBeforeUpdate != "function" ||
            (p === e.memoizedProps && k === e.memoizedState) ||
            (t.flags |= 1024),
          (s = !1));
    }
    return Oo(e, t, n, s, a, o);
  }
  function Oo(e, t, n, s, o, a) {
    Td(e, t);
    var d = (t.flags & 128) !== 0;
    if (!s && !d) return o && Ic(t, n, !1), bt(e, t, a);
    (s = t.stateNode), (Xg.current = t);
    var p =
      d && typeof n.getDerivedStateFromError != "function" ? null : s.render();
    return (
      (t.flags |= 1),
      e !== null && d
        ? ((t.child = sr(t, e.child, null, a)), (t.child = sr(t, null, p, a)))
        : be(e, t, p, a),
      (t.memoizedState = s.state),
      o && Ic(t, n, !0),
      t.child
    );
  }
  function Ld(e) {
    var t = e.stateNode;
    t.pendingContext
      ? Oc(e, t.pendingContext, t.pendingContext !== t.context)
      : t.context && Oc(e, t.context, !1),
      ho(e, t.containerInfo);
  }
  function Nd(e, t, n, s, o) {
    return ir(), so(o), (t.flags |= 256), be(e, t, n, s), t.child;
  }
  var Po = { dehydrated: null, treeContext: null, retryLane: 0 };
  function Io(e) {
    return { baseLanes: e, cachePool: null, transitions: null };
  }
  function Od(e, t, n) {
    var s = t.pendingProps,
      o = ve.current,
      a = !1,
      d = (t.flags & 128) !== 0,
      p;
    if (
      ((p = d) ||
        (p = e !== null && e.memoizedState === null ? !1 : (o & 2) !== 0),
      p
        ? ((a = !0), (t.flags &= -129))
        : (e === null || e.memoizedState !== null) && (o |= 1),
      de(ve, o & 1),
      e === null)
    )
      return (
        io(t),
        (e = t.memoizedState),
        e !== null && ((e = e.dehydrated), e !== null)
          ? ((t.mode & 1) === 0
              ? (t.lanes = 1)
              : e.data === "$!"
                ? (t.lanes = 8)
                : (t.lanes = 1073741824),
            null)
          : ((d = s.children),
            (e = s.fallback),
            a
              ? ((s = t.mode),
                (a = t.child),
                (d = { mode: "hidden", children: d }),
                (s & 1) === 0 && a !== null
                  ? ((a.childLanes = 0), (a.pendingProps = d))
                  : (a = Ms(d, s, 0, null)),
                (e = Mn(e, s, n, null)),
                (a.return = t),
                (e.return = t),
                (a.sibling = e),
                (t.child = a),
                (t.child.memoizedState = Io(n)),
                (t.memoizedState = Po),
                e)
              : Mo(t, d))
      );
    if (((o = e.memoizedState), o !== null && ((p = o.dehydrated), p !== null)))
      return Kg(e, t, d, s, p, o, n);
    if (a) {
      (a = s.fallback), (d = t.mode), (o = e.child), (p = o.sibling);
      var m = { mode: "hidden", children: s.children };
      return (
        (d & 1) === 0 && t.child !== o
          ? ((s = t.child),
            (s.childLanes = 0),
            (s.pendingProps = m),
            (t.deletions = null))
          : ((s = pn(o, m)), (s.subtreeFlags = o.subtreeFlags & 14680064)),
        p !== null ? (a = pn(p, a)) : ((a = Mn(a, d, n, null)), (a.flags |= 2)),
        (a.return = t),
        (s.return = t),
        (s.sibling = a),
        (t.child = s),
        (s = a),
        (a = t.child),
        (d = e.child.memoizedState),
        (d =
          d === null
            ? Io(n)
            : {
                baseLanes: d.baseLanes | n,
                cachePool: null,
                transitions: d.transitions,
              }),
        (a.memoizedState = d),
        (a.childLanes = e.childLanes & ~n),
        (t.memoizedState = Po),
        s
      );
    }
    return (
      (a = e.child),
      (e = a.sibling),
      (s = pn(a, { mode: "visible", children: s.children })),
      (t.mode & 1) === 0 && (s.lanes = n),
      (s.return = t),
      (s.sibling = null),
      e !== null &&
        ((n = t.deletions),
        n === null ? ((t.deletions = [e]), (t.flags |= 16)) : n.push(e)),
      (t.child = s),
      (t.memoizedState = null),
      s
    );
  }
  function Mo(e, t) {
    return (
      (t = Ms({ mode: "visible", children: t }, e.mode, 0, null)),
      (t.return = e),
      (e.child = t)
    );
  }
  function _s(e, t, n, s) {
    return (
      s !== null && so(s),
      sr(t, e.child, null, n),
      (e = Mo(t, t.pendingProps.children)),
      (e.flags |= 2),
      (t.memoizedState = null),
      e
    );
  }
  function Kg(e, t, n, s, o, a, d) {
    if (n)
      return t.flags & 256
        ? ((t.flags &= -257), (s = Ro(Error(l(422)))), _s(e, t, d, s))
        : t.memoizedState !== null
          ? ((t.child = e.child), (t.flags |= 128), null)
          : ((a = s.fallback),
            (o = t.mode),
            (s = Ms({ mode: "visible", children: s.children }, o, 0, null)),
            (a = Mn(a, o, d, null)),
            (a.flags |= 2),
            (s.return = t),
            (a.return = t),
            (s.sibling = a),
            (t.child = s),
            (t.mode & 1) !== 0 && sr(t, e.child, null, d),
            (t.child.memoizedState = Io(d)),
            (t.memoizedState = Po),
            a);
    if ((t.mode & 1) === 0) return _s(e, t, d, null);
    if (o.data === "$!") {
      if (((s = o.nextSibling && o.nextSibling.dataset), s)) var p = s.dgst;
      return (
        (s = p), (a = Error(l(419))), (s = Ro(a, s, void 0)), _s(e, t, d, s)
      );
    }
    if (((p = (d & e.childLanes) !== 0), Xe || p)) {
      if (((s = Pe), s !== null)) {
        switch (d & -d) {
          case 4:
            o = 2;
            break;
          case 16:
            o = 8;
            break;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            o = 32;
            break;
          case 536870912:
            o = 268435456;
            break;
          default:
            o = 0;
        }
        (o = (o & (s.suspendedLanes | d)) !== 0 ? 0 : o),
          o !== 0 &&
            o !== a.retryLane &&
            ((a.retryLane = o), Gt(e, o), Ct(s, e, o, -1));
      }
      return Ko(), (s = Ro(Error(l(421)))), _s(e, t, d, s);
    }
    return o.data === "$?"
      ? ((t.flags |= 128),
        (t.child = e.child),
        (t = av.bind(null, e)),
        (o._reactRetry = t),
        null)
      : ((e = a.treeContext),
        (it = nn(o.nextSibling)),
        (rt = t),
        (ge = !0),
        (St = null),
        e !== null &&
          ((ut[ct++] = Ht),
          (ut[ct++] = Ut),
          (ut[ct++] = kn),
          (Ht = e.id),
          (Ut = e.overflow),
          (kn = t)),
        (t = Mo(t, s.children)),
        (t.flags |= 4096),
        t);
  }
  function Pd(e, t, n) {
    e.lanes |= t;
    var s = e.alternate;
    s !== null && (s.lanes |= t), uo(e.return, t, n);
  }
  function Do(e, t, n, s, o) {
    var a = e.memoizedState;
    a === null
      ? (e.memoizedState = {
          isBackwards: t,
          rendering: null,
          renderingStartTime: 0,
          last: s,
          tail: n,
          tailMode: o,
        })
      : ((a.isBackwards = t),
        (a.rendering = null),
        (a.renderingStartTime = 0),
        (a.last = s),
        (a.tail = n),
        (a.tailMode = o));
  }
  function Id(e, t, n) {
    var s = t.pendingProps,
      o = s.revealOrder,
      a = s.tail;
    if ((be(e, t, s.children, n), (s = ve.current), (s & 2) !== 0))
      (s = (s & 1) | 2), (t.flags |= 128);
    else {
      if (e !== null && (e.flags & 128) !== 0)
        e: for (e = t.child; e !== null; ) {
          if (e.tag === 13) e.memoizedState !== null && Pd(e, n, t);
          else if (e.tag === 19) Pd(e, n, t);
          else if (e.child !== null) {
            (e.child.return = e), (e = e.child);
            continue;
          }
          if (e === t) break e;
          for (; e.sibling === null; ) {
            if (e.return === null || e.return === t) break e;
            e = e.return;
          }
          (e.sibling.return = e.return), (e = e.sibling);
        }
      s &= 1;
    }
    if ((de(ve, s), (t.mode & 1) === 0)) t.memoizedState = null;
    else
      switch (o) {
        case "forwards":
          for (n = t.child, o = null; n !== null; )
            (e = n.alternate),
              e !== null && hs(e) === null && (o = n),
              (n = n.sibling);
          (n = o),
            n === null
              ? ((o = t.child), (t.child = null))
              : ((o = n.sibling), (n.sibling = null)),
            Do(t, !1, o, n, a);
          break;
        case "backwards":
          for (n = null, o = t.child, t.child = null; o !== null; ) {
            if (((e = o.alternate), e !== null && hs(e) === null)) {
              t.child = o;
              break;
            }
            (e = o.sibling), (o.sibling = n), (n = o), (o = e);
          }
          Do(t, !0, n, null, a);
          break;
        case "together":
          Do(t, !1, null, null, void 0);
          break;
        default:
          t.memoizedState = null;
      }
    return t.child;
  }
  function Es(e, t) {
    (t.mode & 1) === 0 &&
      e !== null &&
      ((e.alternate = null), (t.alternate = null), (t.flags |= 2));
  }
  function bt(e, t, n) {
    if (
      (e !== null && (t.dependencies = e.dependencies),
      (Nn |= t.lanes),
      (n & t.childLanes) === 0)
    )
      return null;
    if (e !== null && t.child !== e.child) throw Error(l(153));
    if (t.child !== null) {
      for (
        e = t.child, n = pn(e, e.pendingProps), t.child = n, n.return = t;
        e.sibling !== null;

      )
        (e = e.sibling),
          (n = n.sibling = pn(e, e.pendingProps)),
          (n.return = t);
      n.sibling = null;
    }
    return t.child;
  }
  function Qg(e, t, n) {
    switch (t.tag) {
      case 3:
        Ld(t), ir();
        break;
      case 5:
        Vc(t);
        break;
      case 1:
        $e(t.type) && rs(t);
        break;
      case 4:
        ho(t, t.stateNode.containerInfo);
        break;
      case 10:
        var s = t.type._context,
          o = t.memoizedProps.value;
        de(us, s._currentValue), (s._currentValue = o);
        break;
      case 13:
        if (((s = t.memoizedState), s !== null))
          return s.dehydrated !== null
            ? (de(ve, ve.current & 1), (t.flags |= 128), null)
            : (n & t.child.childLanes) !== 0
              ? Od(e, t, n)
              : (de(ve, ve.current & 1),
                (e = bt(e, t, n)),
                e !== null ? e.sibling : null);
        de(ve, ve.current & 1);
        break;
      case 19:
        if (((s = (n & t.childLanes) !== 0), (e.flags & 128) !== 0)) {
          if (s) return Id(e, t, n);
          t.flags |= 128;
        }
        if (
          ((o = t.memoizedState),
          o !== null &&
            ((o.rendering = null), (o.tail = null), (o.lastEffect = null)),
          de(ve, ve.current),
          s)
        )
          break;
        return null;
      case 22:
      case 23:
        return (t.lanes = 0), Ad(e, t, n);
    }
    return bt(e, t, n);
  }
  var Md, Bo, Dd, Bd;
  (Md = function (e, t) {
    for (var n = t.child; n !== null; ) {
      if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
      else if (n.tag !== 4 && n.child !== null) {
        (n.child.return = n), (n = n.child);
        continue;
      }
      if (n === t) break;
      for (; n.sibling === null; ) {
        if (n.return === null || n.return === t) return;
        n = n.return;
      }
      (n.sibling.return = n.return), (n = n.sibling);
    }
  }),
    (Bo = function () {}),
    (Dd = function (e, t, n, s) {
      var o = e.memoizedProps;
      if (o !== s) {
        (e = t.stateNode), Rn(Nt.current);
        var a = null;
        switch (n) {
          case "input":
            (o = ul(e, o)), (s = ul(e, s)), (a = []);
            break;
          case "select":
            (o = F({}, o, { value: void 0 })),
              (s = F({}, s, { value: void 0 })),
              (a = []);
            break;
          case "textarea":
            (o = fl(e, o)), (s = fl(e, s)), (a = []);
            break;
          default:
            typeof o.onClick != "function" &&
              typeof s.onClick == "function" &&
              (e.onclick = es);
        }
        pl(n, s);
        var d;
        n = null;
        for (C in o)
          if (!s.hasOwnProperty(C) && o.hasOwnProperty(C) && o[C] != null)
            if (C === "style") {
              var p = o[C];
              for (d in p) p.hasOwnProperty(d) && (n || (n = {}), (n[d] = ""));
            } else
              C !== "dangerouslySetInnerHTML" &&
                C !== "children" &&
                C !== "suppressContentEditableWarning" &&
                C !== "suppressHydrationWarning" &&
                C !== "autoFocus" &&
                (c.hasOwnProperty(C)
                  ? a || (a = [])
                  : (a = a || []).push(C, null));
        for (C in s) {
          var m = s[C];
          if (
            ((p = o?.[C]),
            s.hasOwnProperty(C) && m !== p && (m != null || p != null))
          )
            if (C === "style")
              if (p) {
                for (d in p)
                  !p.hasOwnProperty(d) ||
                    (m && m.hasOwnProperty(d)) ||
                    (n || (n = {}), (n[d] = ""));
                for (d in m)
                  m.hasOwnProperty(d) &&
                    p[d] !== m[d] &&
                    (n || (n = {}), (n[d] = m[d]));
              } else n || (a || (a = []), a.push(C, n)), (n = m);
            else
              C === "dangerouslySetInnerHTML"
                ? ((m = m ? m.__html : void 0),
                  (p = p ? p.__html : void 0),
                  m != null && p !== m && (a = a || []).push(C, m))
                : C === "children"
                  ? (typeof m != "string" && typeof m != "number") ||
                    (a = a || []).push(C, "" + m)
                  : C !== "suppressContentEditableWarning" &&
                    C !== "suppressHydrationWarning" &&
                    (c.hasOwnProperty(C)
                      ? (m != null && C === "onScroll" && he("scroll", e),
                        a || p === m || (a = []))
                      : (a = a || []).push(C, m));
        }
        n && (a = a || []).push("style", n);
        var C = a;
        (t.updateQueue = C) && (t.flags |= 4);
      }
    }),
    (Bd = function (e, t, n, s) {
      n !== s && (t.flags |= 4);
    });
  function ri(e, t) {
    if (!ge)
      switch (e.tailMode) {
        case "hidden":
          t = e.tail;
          for (var n = null; t !== null; )
            t.alternate !== null && (n = t), (t = t.sibling);
          n === null ? (e.tail = null) : (n.sibling = null);
          break;
        case "collapsed":
          n = e.tail;
          for (var s = null; n !== null; )
            n.alternate !== null && (s = n), (n = n.sibling);
          s === null
            ? t || e.tail === null
              ? (e.tail = null)
              : (e.tail.sibling = null)
            : (s.sibling = null);
      }
  }
  function He(e) {
    var t = e.alternate !== null && e.alternate.child === e.child,
      n = 0,
      s = 0;
    if (t)
      for (var o = e.child; o !== null; )
        (n |= o.lanes | o.childLanes),
          (s |= o.subtreeFlags & 14680064),
          (s |= o.flags & 14680064),
          (o.return = e),
          (o = o.sibling);
    else
      for (o = e.child; o !== null; )
        (n |= o.lanes | o.childLanes),
          (s |= o.subtreeFlags),
          (s |= o.flags),
          (o.return = e),
          (o = o.sibling);
    return (e.subtreeFlags |= s), (e.childLanes = n), t;
  }
  function Zg(e, t, n) {
    var s = t.pendingProps;
    switch ((no(t), t.tag)) {
      case 2:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return He(t), null;
      case 1:
        return $e(t.type) && ns(), He(t), null;
      case 3:
        return (
          (s = t.stateNode),
          ar(),
          pe(Ve),
          pe(xe),
          go(),
          s.pendingContext &&
            ((s.context = s.pendingContext), (s.pendingContext = null)),
          (e === null || e.child === null) &&
            (os(t)
              ? (t.flags |= 4)
              : e === null ||
                (e.memoizedState.isDehydrated && (t.flags & 256) === 0) ||
                ((t.flags |= 1024), St !== null && (Vo(St), (St = null)))),
          Bo(e, t),
          He(t),
          null
        );
      case 5:
        po(t);
        var o = Rn(qr.current);
        if (((n = t.type), e !== null && t.stateNode != null))
          Dd(e, t, n, s, o),
            e.ref !== t.ref && ((t.flags |= 512), (t.flags |= 2097152));
        else {
          if (!s) {
            if (t.stateNode === null) throw Error(l(166));
            return He(t), null;
          }
          if (((e = Rn(Nt.current)), os(t))) {
            (s = t.stateNode), (n = t.type);
            var a = t.memoizedProps;
            switch (((s[Lt] = t), (s[$r] = a), (e = (t.mode & 1) !== 0), n)) {
              case "dialog":
                he("cancel", s), he("close", s);
                break;
              case "iframe":
              case "object":
              case "embed":
                he("load", s);
                break;
              case "video":
              case "audio":
                for (o = 0; o < Yr.length; o++) he(Yr[o], s);
                break;
              case "source":
                he("error", s);
                break;
              case "img":
              case "image":
              case "link":
                he("error", s), he("load", s);
                break;
              case "details":
                he("toggle", s);
                break;
              case "input":
                mu(s, a), he("invalid", s);
                break;
              case "select":
                (s._wrapperState = { wasMultiple: !!a.multiple }),
                  he("invalid", s);
                break;
              case "textarea":
                yu(s, a), he("invalid", s);
            }
            pl(n, a), (o = null);
            for (var d in a)
              if (a.hasOwnProperty(d)) {
                var p = a[d];
                d === "children"
                  ? typeof p == "string"
                    ? s.textContent !== p &&
                      (a.suppressHydrationWarning !== !0 &&
                        Ji(s.textContent, p, e),
                      (o = ["children", p]))
                    : typeof p == "number" &&
                      s.textContent !== "" + p &&
                      (a.suppressHydrationWarning !== !0 &&
                        Ji(s.textContent, p, e),
                      (o = ["children", "" + p]))
                  : c.hasOwnProperty(d) &&
                    p != null &&
                    d === "onScroll" &&
                    he("scroll", s);
              }
            switch (n) {
              case "input":
                Oi(s), vu(s, a, !0);
                break;
              case "textarea":
                Oi(s), _u(s);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof a.onClick == "function" && (s.onclick = es);
            }
            (s = o), (t.updateQueue = s), s !== null && (t.flags |= 4);
          } else {
            (d = o.nodeType === 9 ? o : o.ownerDocument),
              e === "http://www.w3.org/1999/xhtml" && (e = Eu(n)),
              e === "http://www.w3.org/1999/xhtml"
                ? n === "script"
                  ? ((e = d.createElement("div")),
                    (e.innerHTML = "<script></script>"),
                    (e = e.removeChild(e.firstChild)))
                  : typeof s.is == "string"
                    ? (e = d.createElement(n, { is: s.is }))
                    : ((e = d.createElement(n)),
                      n === "select" &&
                        ((d = e),
                        s.multiple
                          ? (d.multiple = !0)
                          : s.size && (d.size = s.size)))
                : (e = d.createElementNS(e, n)),
              (e[Lt] = t),
              (e[$r] = s),
              Md(e, t, !1, !1),
              (t.stateNode = e);
            e: {
              switch (((d = ml(n, s)), n)) {
                case "dialog":
                  he("cancel", e), he("close", e), (o = s);
                  break;
                case "iframe":
                case "object":
                case "embed":
                  he("load", e), (o = s);
                  break;
                case "video":
                case "audio":
                  for (o = 0; o < Yr.length; o++) he(Yr[o], e);
                  o = s;
                  break;
                case "source":
                  he("error", e), (o = s);
                  break;
                case "img":
                case "image":
                case "link":
                  he("error", e), he("load", e), (o = s);
                  break;
                case "details":
                  he("toggle", e), (o = s);
                  break;
                case "input":
                  mu(e, s), (o = ul(e, s)), he("invalid", e);
                  break;
                case "option":
                  o = s;
                  break;
                case "select":
                  (e._wrapperState = { wasMultiple: !!s.multiple }),
                    (o = F({}, s, { value: void 0 })),
                    he("invalid", e);
                  break;
                case "textarea":
                  yu(e, s), (o = fl(e, s)), he("invalid", e);
                  break;
                default:
                  o = s;
              }
              pl(n, o), (p = o);
              for (a in p)
                if (p.hasOwnProperty(a)) {
                  var m = p[a];
                  a === "style"
                    ? ku(e, m)
                    : a === "dangerouslySetInnerHTML"
                      ? ((m = m ? m.__html : void 0), m != null && wu(e, m))
                      : a === "children"
                        ? typeof m == "string"
                          ? (n !== "textarea" || m !== "") && Ar(e, m)
                          : typeof m == "number" && Ar(e, "" + m)
                        : a !== "suppressContentEditableWarning" &&
                          a !== "suppressHydrationWarning" &&
                          a !== "autoFocus" &&
                          (c.hasOwnProperty(a)
                            ? m != null && a === "onScroll" && he("scroll", e)
                            : m != null && J(e, a, m, d));
                }
              switch (n) {
                case "input":
                  Oi(e), vu(e, s, !1);
                  break;
                case "textarea":
                  Oi(e), _u(e);
                  break;
                case "option":
                  s.value != null && e.setAttribute("value", "" + le(s.value));
                  break;
                case "select":
                  (e.multiple = !!s.multiple),
                    (a = s.value),
                    a != null
                      ? Wn(e, !!s.multiple, a, !1)
                      : s.defaultValue != null &&
                        Wn(e, !!s.multiple, s.defaultValue, !0);
                  break;
                default:
                  typeof o.onClick == "function" && (e.onclick = es);
              }
              switch (n) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  s = !!s.autoFocus;
                  break e;
                case "img":
                  s = !0;
                  break e;
                default:
                  s = !1;
              }
            }
            s && (t.flags |= 4);
          }
          t.ref !== null && ((t.flags |= 512), (t.flags |= 2097152));
        }
        return He(t), null;
      case 6:
        if (e && t.stateNode != null) Bd(e, t, e.memoizedProps, s);
        else {
          if (typeof s != "string" && t.stateNode === null) throw Error(l(166));
          if (((n = Rn(qr.current)), Rn(Nt.current), os(t))) {
            if (
              ((s = t.stateNode),
              (n = t.memoizedProps),
              (s[Lt] = t),
              (a = s.nodeValue !== n) && ((e = rt), e !== null))
            )
              switch (e.tag) {
                case 3:
                  Ji(s.nodeValue, n, (e.mode & 1) !== 0);
                  break;
                case 5:
                  e.memoizedProps.suppressHydrationWarning !== !0 &&
                    Ji(s.nodeValue, n, (e.mode & 1) !== 0);
              }
            a && (t.flags |= 4);
          } else
            (s = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(s)),
              (s[Lt] = t),
              (t.stateNode = s);
        }
        return He(t), null;
      case 13:
        if (
          (pe(ve),
          (s = t.memoizedState),
          e === null ||
            (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
        ) {
          if (ge && it !== null && (t.mode & 1) !== 0 && (t.flags & 128) === 0)
            Hc(), ir(), (t.flags |= 98560), (a = !1);
          else if (((a = os(t)), s !== null && s.dehydrated !== null)) {
            if (e === null) {
              if (!a) throw Error(l(318));
              if (
                ((a = t.memoizedState),
                (a = a !== null ? a.dehydrated : null),
                !a)
              )
                throw Error(l(317));
              a[Lt] = t;
            } else
              ir(),
                (t.flags & 128) === 0 && (t.memoizedState = null),
                (t.flags |= 4);
            He(t), (a = !1);
          } else St !== null && (Vo(St), (St = null)), (a = !0);
          if (!a) return t.flags & 65536 ? t : null;
        }
        return (t.flags & 128) !== 0
          ? ((t.lanes = n), t)
          : ((s = s !== null),
            s !== (e !== null && e.memoizedState !== null) &&
              s &&
              ((t.child.flags |= 8192),
              (t.mode & 1) !== 0 &&
                (e === null || (ve.current & 1) !== 0
                  ? Re === 0 && (Re = 3)
                  : Ko())),
            t.updateQueue !== null && (t.flags |= 4),
            He(t),
            null);
      case 4:
        return (
          ar(),
          Bo(e, t),
          e === null && jr(t.stateNode.containerInfo),
          He(t),
          null
        );
      case 10:
        return ao(t.type._context), He(t), null;
      case 17:
        return $e(t.type) && ns(), He(t), null;
      case 19:
        if ((pe(ve), (a = t.memoizedState), a === null)) return He(t), null;
        if (((s = (t.flags & 128) !== 0), (d = a.rendering), d === null))
          if (s) ri(a, !1);
          else {
            if (Re !== 0 || (e !== null && (e.flags & 128) !== 0))
              for (e = t.child; e !== null; ) {
                if (((d = hs(e)), d !== null)) {
                  for (
                    t.flags |= 128,
                      ri(a, !1),
                      s = d.updateQueue,
                      s !== null && ((t.updateQueue = s), (t.flags |= 4)),
                      t.subtreeFlags = 0,
                      s = n,
                      n = t.child;
                    n !== null;

                  )
                    (a = n),
                      (e = s),
                      (a.flags &= 14680066),
                      (d = a.alternate),
                      d === null
                        ? ((a.childLanes = 0),
                          (a.lanes = e),
                          (a.child = null),
                          (a.subtreeFlags = 0),
                          (a.memoizedProps = null),
                          (a.memoizedState = null),
                          (a.updateQueue = null),
                          (a.dependencies = null),
                          (a.stateNode = null))
                        : ((a.childLanes = d.childLanes),
                          (a.lanes = d.lanes),
                          (a.child = d.child),
                          (a.subtreeFlags = 0),
                          (a.deletions = null),
                          (a.memoizedProps = d.memoizedProps),
                          (a.memoizedState = d.memoizedState),
                          (a.updateQueue = d.updateQueue),
                          (a.type = d.type),
                          (e = d.dependencies),
                          (a.dependencies =
                            e === null
                              ? null
                              : {
                                  lanes: e.lanes,
                                  firstContext: e.firstContext,
                                })),
                      (n = n.sibling);
                  return de(ve, (ve.current & 1) | 2), t.child;
                }
                e = e.sibling;
              }
            a.tail !== null &&
              we() > fr &&
              ((t.flags |= 128), (s = !0), ri(a, !1), (t.lanes = 4194304));
          }
        else {
          if (!s)
            if (((e = hs(d)), e !== null)) {
              if (
                ((t.flags |= 128),
                (s = !0),
                (n = e.updateQueue),
                n !== null && ((t.updateQueue = n), (t.flags |= 4)),
                ri(a, !0),
                a.tail === null &&
                  a.tailMode === "hidden" &&
                  !d.alternate &&
                  !ge)
              )
                return He(t), null;
            } else
              2 * we() - a.renderingStartTime > fr &&
                n !== 1073741824 &&
                ((t.flags |= 128), (s = !0), ri(a, !1), (t.lanes = 4194304));
          a.isBackwards
            ? ((d.sibling = t.child), (t.child = d))
            : ((n = a.last),
              n !== null ? (n.sibling = d) : (t.child = d),
              (a.last = d));
        }
        return a.tail !== null
          ? ((t = a.tail),
            (a.rendering = t),
            (a.tail = t.sibling),
            (a.renderingStartTime = we()),
            (t.sibling = null),
            (n = ve.current),
            de(ve, s ? (n & 1) | 2 : n & 1),
            t)
          : (He(t), null);
      case 22:
      case 23:
        return (
          Xo(),
          (s = t.memoizedState !== null),
          e !== null && (e.memoizedState !== null) !== s && (t.flags |= 8192),
          s && (t.mode & 1) !== 0
            ? (st & 1073741824) !== 0 &&
              (He(t), t.subtreeFlags & 6 && (t.flags |= 8192))
            : He(t),
          null
        );
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(l(156, t.tag));
  }
  function qg(e, t) {
    switch ((no(t), t.tag)) {
      case 1:
        return (
          $e(t.type) && ns(),
          (e = t.flags),
          e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
        );
      case 3:
        return (
          ar(),
          pe(Ve),
          pe(xe),
          go(),
          (e = t.flags),
          (e & 65536) !== 0 && (e & 128) === 0
            ? ((t.flags = (e & -65537) | 128), t)
            : null
        );
      case 5:
        return po(t), null;
      case 13:
        if (
          (pe(ve), (e = t.memoizedState), e !== null && e.dehydrated !== null)
        ) {
          if (t.alternate === null) throw Error(l(340));
          ir();
        }
        return (
          (e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
        );
      case 19:
        return pe(ve), null;
      case 4:
        return ar(), null;
      case 10:
        return ao(t.type._context), null;
      case 22:
      case 23:
        return Xo(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var ws = !1,
    Ue = !1,
    Jg = typeof WeakSet == "function" ? WeakSet : Set,
    x = null;
  function cr(e, t) {
    var n = e.ref;
    if (n !== null)
      if (typeof n == "function")
        try {
          n(null);
        } catch (s) {
          Ee(e, t, s);
        }
      else n.current = null;
  }
  function xo(e, t, n) {
    try {
      n();
    } catch (s) {
      Ee(e, t, s);
    }
  }
  var xd = !1;
  function ev(e, t) {
    if ((($l = bi), (e = pc()), Ul(e))) {
      if ("selectionStart" in e)
        var n = { start: e.selectionStart, end: e.selectionEnd };
      else
        e: {
          n = ((n = e.ownerDocument) && n.defaultView) || window;
          var s = n.getSelection && n.getSelection();
          if (s && s.rangeCount !== 0) {
            n = s.anchorNode;
            var o = s.anchorOffset,
              a = s.focusNode;
            s = s.focusOffset;
            try {
              n.nodeType, a.nodeType;
            } catch {
              n = null;
              break e;
            }
            var d = 0,
              p = -1,
              m = -1,
              C = 0,
              T = 0,
              N = e,
              k = null;
            t: for (;;) {
              for (
                var B;
                N !== n || (o !== 0 && N.nodeType !== 3) || (p = d + o),
                  N !== a || (s !== 0 && N.nodeType !== 3) || (m = d + s),
                  N.nodeType === 3 && (d += N.nodeValue.length),
                  (B = N.firstChild) !== null;

              )
                (k = N), (N = B);
              for (;;) {
                if (N === e) break t;
                if (
                  (k === n && ++C === o && (p = d),
                  k === a && ++T === s && (m = d),
                  (B = N.nextSibling) !== null)
                )
                  break;
                (N = k), (k = N.parentNode);
              }
              N = B;
            }
            n = p === -1 || m === -1 ? null : { start: p, end: m };
          } else n = null;
        }
      n = n || { start: 0, end: 0 };
    } else n = null;
    for (
      Xl = { focusedElem: e, selectionRange: n }, bi = !1, x = t;
      x !== null;

    )
      if (((t = x), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null))
        (e.return = t), (x = e);
      else
        for (; x !== null; ) {
          t = x;
          try {
            var H = t.alternate;
            if ((t.flags & 1024) !== 0)
              switch (t.tag) {
                case 0:
                case 11:
                case 15:
                  break;
                case 1:
                  if (H !== null) {
                    var U = H.memoizedProps,
                      Ce = H.memoizedState,
                      S = t.stateNode,
                      v = S.getSnapshotBeforeUpdate(
                        t.elementType === t.type ? U : _t(t.type, U),
                        Ce,
                      );
                    S.__reactInternalSnapshotBeforeUpdate = v;
                  }
                  break;
                case 3:
                  var E = t.stateNode.containerInfo;
                  E.nodeType === 1
                    ? (E.textContent = "")
                    : E.nodeType === 9 &&
                      E.documentElement &&
                      E.removeChild(E.documentElement);
                  break;
                case 5:
                case 6:
                case 4:
                case 17:
                  break;
                default:
                  throw Error(l(163));
              }
          } catch (I) {
            Ee(t, t.return, I);
          }
          if (((e = t.sibling), e !== null)) {
            (e.return = t.return), (x = e);
            break;
          }
          x = t.return;
        }
    return (H = xd), (xd = !1), H;
  }
  function ii(e, t, n) {
    var s = t.updateQueue;
    if (((s = s !== null ? s.lastEffect : null), s !== null)) {
      var o = (s = s.next);
      do {
        if ((o.tag & e) === e) {
          var a = o.destroy;
          (o.destroy = void 0), a !== void 0 && xo(t, n, a);
        }
        o = o.next;
      } while (o !== s);
    }
  }
  function Cs(e, t) {
    if (
      ((t = t.updateQueue), (t = t !== null ? t.lastEffect : null), t !== null)
    ) {
      var n = (t = t.next);
      do {
        if ((n.tag & e) === e) {
          var s = n.create;
          n.destroy = s();
        }
        n = n.next;
      } while (n !== t);
    }
  }
  function Fo(e) {
    var t = e.ref;
    if (t !== null) {
      var n = e.stateNode;
      e.tag, (e = n), typeof t == "function" ? t(e) : (t.current = e);
    }
  }
  function Fd(e) {
    var t = e.alternate;
    t !== null && ((e.alternate = null), Fd(t)),
      (e.child = null),
      (e.deletions = null),
      (e.sibling = null),
      e.tag === 5 &&
        ((t = e.stateNode),
        t !== null &&
          (delete t[Lt],
          delete t[$r],
          delete t[ql],
          delete t[xg],
          delete t[Fg])),
      (e.stateNode = null),
      (e.return = null),
      (e.dependencies = null),
      (e.memoizedProps = null),
      (e.memoizedState = null),
      (e.pendingProps = null),
      (e.stateNode = null),
      (e.updateQueue = null);
  }
  function Hd(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 4;
  }
  function Ud(e) {
    e: for (;;) {
      for (; e.sibling === null; ) {
        if (e.return === null || Hd(e.return)) return null;
        e = e.return;
      }
      for (
        e.sibling.return = e.return, e = e.sibling;
        e.tag !== 5 && e.tag !== 6 && e.tag !== 18;

      ) {
        if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
        (e.child.return = e), (e = e.child);
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function Ho(e, t, n) {
    var s = e.tag;
    if (s === 5 || s === 6)
      (e = e.stateNode),
        t
          ? n.nodeType === 8
            ? n.parentNode.insertBefore(e, t)
            : n.insertBefore(e, t)
          : (n.nodeType === 8
              ? ((t = n.parentNode), t.insertBefore(e, n))
              : ((t = n), t.appendChild(e)),
            (n = n._reactRootContainer),
            n != null || t.onclick !== null || (t.onclick = es));
    else if (s !== 4 && ((e = e.child), e !== null))
      for (Ho(e, t, n), e = e.sibling; e !== null; )
        Ho(e, t, n), (e = e.sibling);
  }
  function Uo(e, t, n) {
    var s = e.tag;
    if (s === 5 || s === 6)
      (e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e);
    else if (s !== 4 && ((e = e.child), e !== null))
      for (Uo(e, t, n), e = e.sibling; e !== null; )
        Uo(e, t, n), (e = e.sibling);
  }
  var De = null,
    Et = !1;
  function un(e, t, n) {
    for (n = n.child; n !== null; ) Gd(e, t, n), (n = n.sibling);
  }
  function Gd(e, t, n) {
    if (Rt && typeof Rt.onCommitFiberUnmount == "function")
      try {
        Rt.onCommitFiberUnmount(xi, n);
      } catch {}
    switch (n.tag) {
      case 5:
        Ue || cr(n, t);
      case 6:
        var s = De,
          o = Et;
        (De = null),
          un(e, t, n),
          (De = s),
          (Et = o),
          De !== null &&
            (Et
              ? ((e = De),
                (n = n.stateNode),
                e.nodeType === 8
                  ? e.parentNode.removeChild(n)
                  : e.removeChild(n))
              : De.removeChild(n.stateNode));
        break;
      case 18:
        De !== null &&
          (Et
            ? ((e = De),
              (n = n.stateNode),
              e.nodeType === 8
                ? Zl(e.parentNode, n)
                : e.nodeType === 1 && Zl(e, n),
              xr(e))
            : Zl(De, n.stateNode));
        break;
      case 4:
        (s = De),
          (o = Et),
          (De = n.stateNode.containerInfo),
          (Et = !0),
          un(e, t, n),
          (De = s),
          (Et = o);
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (
          !Ue &&
          ((s = n.updateQueue), s !== null && ((s = s.lastEffect), s !== null))
        ) {
          o = s = s.next;
          do {
            var a = o,
              d = a.destroy;
            (a = a.tag),
              d !== void 0 && ((a & 2) !== 0 || (a & 4) !== 0) && xo(n, t, d),
              (o = o.next);
          } while (o !== s);
        }
        un(e, t, n);
        break;
      case 1:
        if (
          !Ue &&
          (cr(n, t),
          (s = n.stateNode),
          typeof s.componentWillUnmount == "function")
        )
          try {
            (s.props = n.memoizedProps),
              (s.state = n.memoizedState),
              s.componentWillUnmount();
          } catch (p) {
            Ee(n, t, p);
          }
        un(e, t, n);
        break;
      case 21:
        un(e, t, n);
        break;
      case 22:
        n.mode & 1
          ? ((Ue = (s = Ue) || n.memoizedState !== null), un(e, t, n), (Ue = s))
          : un(e, t, n);
        break;
      default:
        un(e, t, n);
    }
  }
  function zd(e) {
    var t = e.updateQueue;
    if (t !== null) {
      e.updateQueue = null;
      var n = e.stateNode;
      n === null && (n = e.stateNode = new Jg()),
        t.forEach(function (s) {
          var o = uv.bind(null, e, s);
          n.has(s) || (n.add(s), s.then(o, o));
        });
    }
  }
  function wt(e, t) {
    var n = t.deletions;
    if (n !== null)
      for (var s = 0; s < n.length; s++) {
        var o = n[s];
        try {
          var a = e,
            d = t,
            p = d;
          e: for (; p !== null; ) {
            switch (p.tag) {
              case 5:
                (De = p.stateNode), (Et = !1);
                break e;
              case 3:
                (De = p.stateNode.containerInfo), (Et = !0);
                break e;
              case 4:
                (De = p.stateNode.containerInfo), (Et = !0);
                break e;
            }
            p = p.return;
          }
          if (De === null) throw Error(l(160));
          Gd(a, d, o), (De = null), (Et = !1);
          var m = o.alternate;
          m !== null && (m.return = null), (o.return = null);
        } catch (C) {
          Ee(o, t, C);
        }
      }
    if (t.subtreeFlags & 12854)
      for (t = t.child; t !== null; ) bd(t, e), (t = t.sibling);
  }
  function bd(e, t) {
    var n = e.alternate,
      s = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if ((wt(t, e), Pt(e), s & 4)) {
          try {
            ii(3, e, e.return), Cs(3, e);
          } catch (U) {
            Ee(e, e.return, U);
          }
          try {
            ii(5, e, e.return);
          } catch (U) {
            Ee(e, e.return, U);
          }
        }
        break;
      case 1:
        wt(t, e), Pt(e), s & 512 && n !== null && cr(n, n.return);
        break;
      case 5:
        if (
          (wt(t, e),
          Pt(e),
          s & 512 && n !== null && cr(n, n.return),
          e.flags & 32)
        ) {
          var o = e.stateNode;
          try {
            Ar(o, "");
          } catch (U) {
            Ee(e, e.return, U);
          }
        }
        if (s & 4 && ((o = e.stateNode), o != null)) {
          var a = e.memoizedProps,
            d = n !== null ? n.memoizedProps : a,
            p = e.type,
            m = e.updateQueue;
          if (((e.updateQueue = null), m !== null))
            try {
              p === "input" && a.type === "radio" && a.name != null && gu(o, a),
                ml(p, d);
              var C = ml(p, a);
              for (d = 0; d < m.length; d += 2) {
                var T = m[d],
                  N = m[d + 1];
                T === "style"
                  ? ku(o, N)
                  : T === "dangerouslySetInnerHTML"
                    ? wu(o, N)
                    : T === "children"
                      ? Ar(o, N)
                      : J(o, T, N, C);
              }
              switch (p) {
                case "input":
                  cl(o, a);
                  break;
                case "textarea":
                  Su(o, a);
                  break;
                case "select":
                  var k = o._wrapperState.wasMultiple;
                  o._wrapperState.wasMultiple = !!a.multiple;
                  var B = a.value;
                  B != null
                    ? Wn(o, !!a.multiple, B, !1)
                    : k !== !!a.multiple &&
                      (a.defaultValue != null
                        ? Wn(o, !!a.multiple, a.defaultValue, !0)
                        : Wn(o, !!a.multiple, a.multiple ? [] : "", !1));
              }
              o[$r] = a;
            } catch (U) {
              Ee(e, e.return, U);
            }
        }
        break;
      case 6:
        if ((wt(t, e), Pt(e), s & 4)) {
          if (e.stateNode === null) throw Error(l(162));
          (o = e.stateNode), (a = e.memoizedProps);
          try {
            o.nodeValue = a;
          } catch (U) {
            Ee(e, e.return, U);
          }
        }
        break;
      case 3:
        if (
          (wt(t, e), Pt(e), s & 4 && n !== null && n.memoizedState.isDehydrated)
        )
          try {
            xr(t.containerInfo);
          } catch (U) {
            Ee(e, e.return, U);
          }
        break;
      case 4:
        wt(t, e), Pt(e);
        break;
      case 13:
        wt(t, e),
          Pt(e),
          (o = e.child),
          o.flags & 8192 &&
            ((a = o.memoizedState !== null),
            (o.stateNode.isHidden = a),
            !a ||
              (o.alternate !== null && o.alternate.memoizedState !== null) ||
              (bo = we())),
          s & 4 && zd(e);
        break;
      case 22:
        if (
          ((T = n !== null && n.memoizedState !== null),
          e.mode & 1 ? ((Ue = (C = Ue) || T), wt(t, e), (Ue = C)) : wt(t, e),
          Pt(e),
          s & 8192)
        ) {
          if (
            ((C = e.memoizedState !== null),
            (e.stateNode.isHidden = C) && !T && (e.mode & 1) !== 0)
          )
            for (x = e, T = e.child; T !== null; ) {
              for (N = x = T; x !== null; ) {
                switch (((k = x), (B = k.child), k.tag)) {
                  case 0:
                  case 11:
                  case 14:
                  case 15:
                    ii(4, k, k.return);
                    break;
                  case 1:
                    cr(k, k.return);
                    var H = k.stateNode;
                    if (typeof H.componentWillUnmount == "function") {
                      (s = k), (n = k.return);
                      try {
                        (t = s),
                          (H.props = t.memoizedProps),
                          (H.state = t.memoizedState),
                          H.componentWillUnmount();
                      } catch (U) {
                        Ee(s, n, U);
                      }
                    }
                    break;
                  case 5:
                    cr(k, k.return);
                    break;
                  case 22:
                    if (k.memoizedState !== null) {
                      jd(N);
                      continue;
                    }
                }
                B !== null ? ((B.return = k), (x = B)) : jd(N);
              }
              T = T.sibling;
            }
          e: for (T = null, N = e; ; ) {
            if (N.tag === 5) {
              if (T === null) {
                T = N;
                try {
                  (o = N.stateNode),
                    C
                      ? ((a = o.style),
                        typeof a.setProperty == "function"
                          ? a.setProperty("display", "none", "important")
                          : (a.display = "none"))
                      : ((p = N.stateNode),
                        (m = N.memoizedProps.style),
                        (d =
                          m != null && m.hasOwnProperty("display")
                            ? m.display
                            : null),
                        (p.style.display = Cu("display", d)));
                } catch (U) {
                  Ee(e, e.return, U);
                }
              }
            } else if (N.tag === 6) {
              if (T === null)
                try {
                  N.stateNode.nodeValue = C ? "" : N.memoizedProps;
                } catch (U) {
                  Ee(e, e.return, U);
                }
            } else if (
              ((N.tag !== 22 && N.tag !== 23) ||
                N.memoizedState === null ||
                N === e) &&
              N.child !== null
            ) {
              (N.child.return = N), (N = N.child);
              continue;
            }
            if (N === e) break e;
            for (; N.sibling === null; ) {
              if (N.return === null || N.return === e) break e;
              T === N && (T = null), (N = N.return);
            }
            T === N && (T = null),
              (N.sibling.return = N.return),
              (N = N.sibling);
          }
        }
        break;
      case 19:
        wt(t, e), Pt(e), s & 4 && zd(e);
        break;
      case 21:
        break;
      default:
        wt(t, e), Pt(e);
    }
  }
  function Pt(e) {
    var t = e.flags;
    if (t & 2) {
      try {
        e: {
          for (var n = e.return; n !== null; ) {
            if (Hd(n)) {
              var s = n;
              break e;
            }
            n = n.return;
          }
          throw Error(l(160));
        }
        switch (s.tag) {
          case 5:
            var o = s.stateNode;
            s.flags & 32 && (Ar(o, ""), (s.flags &= -33));
            var a = Ud(e);
            Uo(e, a, o);
            break;
          case 3:
          case 4:
            var d = s.stateNode.containerInfo,
              p = Ud(e);
            Ho(e, p, d);
            break;
          default:
            throw Error(l(161));
        }
      } catch (m) {
        Ee(e, e.return, m);
      }
      e.flags &= -3;
    }
    t & 4096 && (e.flags &= -4097);
  }
  function tv(e, t, n) {
    (x = e), Wd(e);
  }
  function Wd(e, t, n) {
    for (var s = (e.mode & 1) !== 0; x !== null; ) {
      var o = x,
        a = o.child;
      if (o.tag === 22 && s) {
        var d = o.memoizedState !== null || ws;
        if (!d) {
          var p = o.alternate,
            m = (p !== null && p.memoizedState !== null) || Ue;
          p = ws;
          var C = Ue;
          if (((ws = d), (Ue = m) && !C))
            for (x = o; x !== null; )
              (d = x),
                (m = d.child),
                d.tag === 22 && d.memoizedState !== null
                  ? Vd(o)
                  : m !== null
                    ? ((m.return = d), (x = m))
                    : Vd(o);
          for (; a !== null; ) (x = a), Wd(a), (a = a.sibling);
          (x = o), (ws = p), (Ue = C);
        }
        Yd(e);
      } else
        (o.subtreeFlags & 8772) !== 0 && a !== null
          ? ((a.return = o), (x = a))
          : Yd(e);
    }
  }
  function Yd(e) {
    for (; x !== null; ) {
      var t = x;
      if ((t.flags & 8772) !== 0) {
        var n = t.alternate;
        try {
          if ((t.flags & 8772) !== 0)
            switch (t.tag) {
              case 0:
              case 11:
              case 15:
                Ue || Cs(5, t);
                break;
              case 1:
                var s = t.stateNode;
                if (t.flags & 4 && !Ue)
                  if (n === null) s.componentDidMount();
                  else {
                    var o =
                      t.elementType === t.type
                        ? n.memoizedProps
                        : _t(t.type, n.memoizedProps);
                    s.componentDidUpdate(
                      o,
                      n.memoizedState,
                      s.__reactInternalSnapshotBeforeUpdate,
                    );
                  }
                var a = t.updateQueue;
                a !== null && jc(t, a, s);
                break;
              case 3:
                var d = t.updateQueue;
                if (d !== null) {
                  if (((n = null), t.child !== null))
                    switch (t.child.tag) {
                      case 5:
                        n = t.child.stateNode;
                        break;
                      case 1:
                        n = t.child.stateNode;
                    }
                  jc(t, d, n);
                }
                break;
              case 5:
                var p = t.stateNode;
                if (n === null && t.flags & 4) {
                  n = p;
                  var m = t.memoizedProps;
                  switch (t.type) {
                    case "button":
                    case "input":
                    case "select":
                    case "textarea":
                      m.autoFocus && n.focus();
                      break;
                    case "img":
                      m.src && (n.src = m.src);
                  }
                }
                break;
              case 6:
                break;
              case 4:
                break;
              case 12:
                break;
              case 13:
                if (t.memoizedState === null) {
                  var C = t.alternate;
                  if (C !== null) {
                    var T = C.memoizedState;
                    if (T !== null) {
                      var N = T.dehydrated;
                      N !== null && xr(N);
                    }
                  }
                }
                break;
              case 19:
              case 17:
              case 21:
              case 22:
              case 23:
              case 25:
                break;
              default:
                throw Error(l(163));
            }
          Ue || (t.flags & 512 && Fo(t));
        } catch (k) {
          Ee(t, t.return, k);
        }
      }
      if (t === e) {
        x = null;
        break;
      }
      if (((n = t.sibling), n !== null)) {
        (n.return = t.return), (x = n);
        break;
      }
      x = t.return;
    }
  }
  function jd(e) {
    for (; x !== null; ) {
      var t = x;
      if (t === e) {
        x = null;
        break;
      }
      var n = t.sibling;
      if (n !== null) {
        (n.return = t.return), (x = n);
        break;
      }
      x = t.return;
    }
  }
  function Vd(e) {
    for (; x !== null; ) {
      var t = x;
      try {
        switch (t.tag) {
          case 0:
          case 11:
          case 15:
            var n = t.return;
            try {
              Cs(4, t);
            } catch (m) {
              Ee(t, n, m);
            }
            break;
          case 1:
            var s = t.stateNode;
            if (typeof s.componentDidMount == "function") {
              var o = t.return;
              try {
                s.componentDidMount();
              } catch (m) {
                Ee(t, o, m);
              }
            }
            var a = t.return;
            try {
              Fo(t);
            } catch (m) {
              Ee(t, a, m);
            }
            break;
          case 5:
            var d = t.return;
            try {
              Fo(t);
            } catch (m) {
              Ee(t, d, m);
            }
        }
      } catch (m) {
        Ee(t, t.return, m);
      }
      if (t === e) {
        x = null;
        break;
      }
      var p = t.sibling;
      if (p !== null) {
        (p.return = t.return), (x = p);
        break;
      }
      x = t.return;
    }
  }
  var nv = Math.ceil,
    ks = se.ReactCurrentDispatcher,
    Go = se.ReactCurrentOwner,
    ht = se.ReactCurrentBatchConfig,
    te = 0,
    Pe = null,
    ke = null,
    Be = 0,
    st = 0,
    dr = rn(0),
    Re = 0,
    si = null,
    Nn = 0,
    As = 0,
    zo = 0,
    li = null,
    Ke = null,
    bo = 0,
    fr = 1 / 0,
    Wt = null,
    Ts = !1,
    Wo = null,
    cn = null,
    Rs = !1,
    dn = null,
    Ls = 0,
    oi = 0,
    Yo = null,
    Ns = -1,
    Os = 0;
  function We() {
    return (te & 6) !== 0 ? we() : Ns !== -1 ? Ns : (Ns = we());
  }
  function fn(e) {
    return (e.mode & 1) === 0
      ? 1
      : (te & 2) !== 0 && Be !== 0
        ? Be & -Be
        : Ug.transition !== null
          ? (Os === 0 && (Os = Uu()), Os)
          : ((e = oe),
            e !== 0 ||
              ((e = window.event), (e = e === void 0 ? 16 : Xu(e.type))),
            e);
  }
  function Ct(e, t, n, s) {
    if (50 < oi) throw ((oi = 0), (Yo = null), Error(l(185)));
    Pr(e, n, s),
      ((te & 2) === 0 || e !== Pe) &&
        (e === Pe && ((te & 2) === 0 && (As |= n), Re === 4 && hn(e, Be)),
        Qe(e, s),
        n === 1 &&
          te === 0 &&
          (t.mode & 1) === 0 &&
          ((fr = we() + 500), is && ln()));
  }
  function Qe(e, t) {
    var n = e.callbackNode;
    Um(e, t);
    var s = Ui(e, e === Pe ? Be : 0);
    if (s === 0)
      n !== null && xu(n), (e.callbackNode = null), (e.callbackPriority = 0);
    else if (((t = s & -s), e.callbackPriority !== t)) {
      if ((n != null && xu(n), t === 1))
        e.tag === 0 ? Hg(Xd.bind(null, e)) : Mc(Xd.bind(null, e)),
          Dg(function () {
            (te & 6) === 0 && ln();
          }),
          (n = null);
      else {
        switch (Gu(s)) {
          case 1:
            n = wl;
            break;
          case 4:
            n = Fu;
            break;
          case 16:
            n = Bi;
            break;
          case 536870912:
            n = Hu;
            break;
          default:
            n = Bi;
        }
        n = nf(n, $d.bind(null, e));
      }
      (e.callbackPriority = t), (e.callbackNode = n);
    }
  }
  function $d(e, t) {
    if (((Ns = -1), (Os = 0), (te & 6) !== 0)) throw Error(l(327));
    var n = e.callbackNode;
    if (hr() && e.callbackNode !== n) return null;
    var s = Ui(e, e === Pe ? Be : 0);
    if (s === 0) return null;
    if ((s & 30) !== 0 || (s & e.expiredLanes) !== 0 || t) t = Ps(e, s);
    else {
      t = s;
      var o = te;
      te |= 2;
      var a = Qd();
      (Pe !== e || Be !== t) && ((Wt = null), (fr = we() + 500), Pn(e, t));
      do
        try {
          sv();
          break;
        } catch (p) {
          Kd(e, p);
        }
      while (!0);
      oo(),
        (ks.current = a),
        (te = o),
        ke !== null ? (t = 0) : ((Pe = null), (Be = 0), (t = Re));
    }
    if (t !== 0) {
      if (
        (t === 2 && ((o = Cl(e)), o !== 0 && ((s = o), (t = jo(e, o)))),
        t === 1)
      )
        throw ((n = si), Pn(e, 0), hn(e, s), Qe(e, we()), n);
      if (t === 6) hn(e, s);
      else {
        if (
          ((o = e.current.alternate),
          (s & 30) === 0 &&
            !rv(o) &&
            ((t = Ps(e, s)),
            t === 2 && ((a = Cl(e)), a !== 0 && ((s = a), (t = jo(e, a)))),
            t === 1))
        )
          throw ((n = si), Pn(e, 0), hn(e, s), Qe(e, we()), n);
        switch (((e.finishedWork = o), (e.finishedLanes = s), t)) {
          case 0:
          case 1:
            throw Error(l(345));
          case 2:
            In(e, Ke, Wt);
            break;
          case 3:
            if (
              (hn(e, s),
              (s & 130023424) === s && ((t = bo + 500 - we()), 10 < t))
            ) {
              if (Ui(e, 0) !== 0) break;
              if (((o = e.suspendedLanes), (o & s) !== s)) {
                We(), (e.pingedLanes |= e.suspendedLanes & o);
                break;
              }
              e.timeoutHandle = Ql(In.bind(null, e, Ke, Wt), t);
              break;
            }
            In(e, Ke, Wt);
            break;
          case 4:
            if ((hn(e, s), (s & 4194240) === s)) break;
            for (t = e.eventTimes, o = -1; 0 < s; ) {
              var d = 31 - vt(s);
              (a = 1 << d), (d = t[d]), d > o && (o = d), (s &= ~a);
            }
            if (
              ((s = o),
              (s = we() - s),
              (s =
                (120 > s
                  ? 120
                  : 480 > s
                    ? 480
                    : 1080 > s
                      ? 1080
                      : 1920 > s
                        ? 1920
                        : 3e3 > s
                          ? 3e3
                          : 4320 > s
                            ? 4320
                            : 1960 * nv(s / 1960)) - s),
              10 < s)
            ) {
              e.timeoutHandle = Ql(In.bind(null, e, Ke, Wt), s);
              break;
            }
            In(e, Ke, Wt);
            break;
          case 5:
            In(e, Ke, Wt);
            break;
          default:
            throw Error(l(329));
        }
      }
    }
    return Qe(e, we()), e.callbackNode === n ? $d.bind(null, e) : null;
  }
  function jo(e, t) {
    var n = li;
    return (
      e.current.memoizedState.isDehydrated && (Pn(e, t).flags |= 256),
      (e = Ps(e, t)),
      e !== 2 && ((t = Ke), (Ke = n), t !== null && Vo(t)),
      e
    );
  }
  function Vo(e) {
    Ke === null ? (Ke = e) : Ke.push.apply(Ke, e);
  }
  function rv(e) {
    for (var t = e; ; ) {
      if (t.flags & 16384) {
        var n = t.updateQueue;
        if (n !== null && ((n = n.stores), n !== null))
          for (var s = 0; s < n.length; s++) {
            var o = n[s],
              a = o.getSnapshot;
            o = o.value;
            try {
              if (!yt(a(), o)) return !1;
            } catch {
              return !1;
            }
          }
      }
      if (((n = t.child), t.subtreeFlags & 16384 && n !== null))
        (n.return = t), (t = n);
      else {
        if (t === e) break;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e) return !0;
          t = t.return;
        }
        (t.sibling.return = t.return), (t = t.sibling);
      }
    }
    return !0;
  }
  function hn(e, t) {
    for (
      t &= ~zo,
        t &= ~As,
        e.suspendedLanes |= t,
        e.pingedLanes &= ~t,
        e = e.expirationTimes;
      0 < t;

    ) {
      var n = 31 - vt(t),
        s = 1 << n;
      (e[n] = -1), (t &= ~s);
    }
  }
  function Xd(e) {
    if ((te & 6) !== 0) throw Error(l(327));
    hr();
    var t = Ui(e, 0);
    if ((t & 1) === 0) return Qe(e, we()), null;
    var n = Ps(e, t);
    if (e.tag !== 0 && n === 2) {
      var s = Cl(e);
      s !== 0 && ((t = s), (n = jo(e, s)));
    }
    if (n === 1) throw ((n = si), Pn(e, 0), hn(e, t), Qe(e, we()), n);
    if (n === 6) throw Error(l(345));
    return (
      (e.finishedWork = e.current.alternate),
      (e.finishedLanes = t),
      In(e, Ke, Wt),
      Qe(e, we()),
      null
    );
  }
  function $o(e, t) {
    var n = te;
    te |= 1;
    try {
      return e(t);
    } finally {
      (te = n), te === 0 && ((fr = we() + 500), is && ln());
    }
  }
  function On(e) {
    dn !== null && dn.tag === 0 && (te & 6) === 0 && hr();
    var t = te;
    te |= 1;
    var n = ht.transition,
      s = oe;
    try {
      if (((ht.transition = null), (oe = 1), e)) return e();
    } finally {
      (oe = s), (ht.transition = n), (te = t), (te & 6) === 0 && ln();
    }
  }
  function Xo() {
    (st = dr.current), pe(dr);
  }
  function Pn(e, t) {
    (e.finishedWork = null), (e.finishedLanes = 0);
    var n = e.timeoutHandle;
    if ((n !== -1 && ((e.timeoutHandle = -1), Mg(n)), ke !== null))
      for (n = ke.return; n !== null; ) {
        var s = n;
        switch ((no(s), s.tag)) {
          case 1:
            (s = s.type.childContextTypes), s != null && ns();
            break;
          case 3:
            ar(), pe(Ve), pe(xe), go();
            break;
          case 5:
            po(s);
            break;
          case 4:
            ar();
            break;
          case 13:
            pe(ve);
            break;
          case 19:
            pe(ve);
            break;
          case 10:
            ao(s.type._context);
            break;
          case 22:
          case 23:
            Xo();
        }
        n = n.return;
      }
    if (
      ((Pe = e),
      (ke = e = pn(e.current, null)),
      (Be = st = t),
      (Re = 0),
      (si = null),
      (zo = As = Nn = 0),
      (Ke = li = null),
      Tn !== null)
    ) {
      for (t = 0; t < Tn.length; t++)
        if (((n = Tn[t]), (s = n.interleaved), s !== null)) {
          n.interleaved = null;
          var o = s.next,
            a = n.pending;
          if (a !== null) {
            var d = a.next;
            (a.next = o), (s.next = d);
          }
          n.pending = s;
        }
      Tn = null;
    }
    return e;
  }
  function Kd(e, t) {
    do {
      var n = ke;
      try {
        if ((oo(), (ps.current = ys), ms)) {
          for (var s = ye.memoizedState; s !== null; ) {
            var o = s.queue;
            o !== null && (o.pending = null), (s = s.next);
          }
          ms = !1;
        }
        if (
          ((Ln = 0),
          (Oe = Te = ye = null),
          (Jr = !1),
          (ei = 0),
          (Go.current = null),
          n === null || n.return === null)
        ) {
          (Re = 1), (si = t), (ke = null);
          break;
        }
        e: {
          var a = e,
            d = n.return,
            p = n,
            m = t;
          if (
            ((t = Be),
            (p.flags |= 32768),
            m !== null && typeof m == "object" && typeof m.then == "function")
          ) {
            var C = m,
              T = p,
              N = T.tag;
            if ((T.mode & 1) === 0 && (N === 0 || N === 11 || N === 15)) {
              var k = T.alternate;
              k
                ? ((T.updateQueue = k.updateQueue),
                  (T.memoizedState = k.memoizedState),
                  (T.lanes = k.lanes))
                : ((T.updateQueue = null), (T.memoizedState = null));
            }
            var B = _d(d);
            if (B !== null) {
              (B.flags &= -257),
                Ed(B, d, p, a, t),
                B.mode & 1 && Sd(a, C, t),
                (t = B),
                (m = C);
              var H = t.updateQueue;
              if (H === null) {
                var U = new Set();
                U.add(m), (t.updateQueue = U);
              } else H.add(m);
              break e;
            } else {
              if ((t & 1) === 0) {
                Sd(a, C, t), Ko();
                break e;
              }
              m = Error(l(426));
            }
          } else if (ge && p.mode & 1) {
            var Ce = _d(d);
            if (Ce !== null) {
              (Ce.flags & 65536) === 0 && (Ce.flags |= 256),
                Ed(Ce, d, p, a, t),
                so(ur(m, p));
              break e;
            }
          }
          (a = m = ur(m, p)),
            Re !== 4 && (Re = 2),
            li === null ? (li = [a]) : li.push(a),
            (a = d);
          do {
            switch (a.tag) {
              case 3:
                (a.flags |= 65536), (t &= -t), (a.lanes |= t);
                var S = vd(a, m, t);
                Yc(a, S);
                break e;
              case 1:
                p = m;
                var v = a.type,
                  E = a.stateNode;
                if (
                  (a.flags & 128) === 0 &&
                  (typeof v.getDerivedStateFromError == "function" ||
                    (E !== null &&
                      typeof E.componentDidCatch == "function" &&
                      (cn === null || !cn.has(E))))
                ) {
                  (a.flags |= 65536), (t &= -t), (a.lanes |= t);
                  var I = yd(a, p, t);
                  Yc(a, I);
                  break e;
                }
            }
            a = a.return;
          } while (a !== null);
        }
        qd(n);
      } catch (G) {
        (t = G), ke === n && n !== null && (ke = n = n.return);
        continue;
      }
      break;
    } while (!0);
  }
  function Qd() {
    var e = ks.current;
    return (ks.current = ys), e === null ? ys : e;
  }
  function Ko() {
    (Re === 0 || Re === 3 || Re === 2) && (Re = 4),
      Pe === null ||
        ((Nn & 268435455) === 0 && (As & 268435455) === 0) ||
        hn(Pe, Be);
  }
  function Ps(e, t) {
    var n = te;
    te |= 2;
    var s = Qd();
    (Pe !== e || Be !== t) && ((Wt = null), Pn(e, t));
    do
      try {
        iv();
        break;
      } catch (o) {
        Kd(e, o);
      }
    while (!0);
    if ((oo(), (te = n), (ks.current = s), ke !== null)) throw Error(l(261));
    return (Pe = null), (Be = 0), Re;
  }
  function iv() {
    for (; ke !== null; ) Zd(ke);
  }
  function sv() {
    for (; ke !== null && !Om(); ) Zd(ke);
  }
  function Zd(e) {
    var t = tf(e.alternate, e, st);
    (e.memoizedProps = e.pendingProps),
      t === null ? qd(e) : (ke = t),
      (Go.current = null);
  }
  function qd(e) {
    var t = e;
    do {
      var n = t.alternate;
      if (((e = t.return), (t.flags & 32768) === 0)) {
        if (((n = Zg(n, t, st)), n !== null)) {
          ke = n;
          return;
        }
      } else {
        if (((n = qg(n, t)), n !== null)) {
          (n.flags &= 32767), (ke = n);
          return;
        }
        if (e !== null)
          (e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null);
        else {
          (Re = 6), (ke = null);
          return;
        }
      }
      if (((t = t.sibling), t !== null)) {
        ke = t;
        return;
      }
      ke = t = e;
    } while (t !== null);
    Re === 0 && (Re = 5);
  }
  function In(e, t, n) {
    var s = oe,
      o = ht.transition;
    try {
      (ht.transition = null), (oe = 1), lv(e, t, n, s);
    } finally {
      (ht.transition = o), (oe = s);
    }
    return null;
  }
  function lv(e, t, n, s) {
    do hr();
    while (dn !== null);
    if ((te & 6) !== 0) throw Error(l(327));
    n = e.finishedWork;
    var o = e.finishedLanes;
    if (n === null) return null;
    if (((e.finishedWork = null), (e.finishedLanes = 0), n === e.current))
      throw Error(l(177));
    (e.callbackNode = null), (e.callbackPriority = 0);
    var a = n.lanes | n.childLanes;
    if (
      (Gm(e, a),
      e === Pe && ((ke = Pe = null), (Be = 0)),
      ((n.subtreeFlags & 2064) === 0 && (n.flags & 2064) === 0) ||
        Rs ||
        ((Rs = !0),
        nf(Bi, function () {
          return hr(), null;
        })),
      (a = (n.flags & 15990) !== 0),
      (n.subtreeFlags & 15990) !== 0 || a)
    ) {
      (a = ht.transition), (ht.transition = null);
      var d = oe;
      oe = 1;
      var p = te;
      (te |= 4),
        (Go.current = null),
        ev(e, n),
        bd(n, e),
        Tg(Xl),
        (bi = !!$l),
        (Xl = $l = null),
        (e.current = n),
        tv(n),
        Pm(),
        (te = p),
        (oe = d),
        (ht.transition = a);
    } else e.current = n;
    if (
      (Rs && ((Rs = !1), (dn = e), (Ls = o)),
      (a = e.pendingLanes),
      a === 0 && (cn = null),
      Dm(n.stateNode),
      Qe(e, we()),
      t !== null)
    )
      for (s = e.onRecoverableError, n = 0; n < t.length; n++)
        (o = t[n]), s(o.value, { componentStack: o.stack, digest: o.digest });
    if (Ts) throw ((Ts = !1), (e = Wo), (Wo = null), e);
    return (
      (Ls & 1) !== 0 && e.tag !== 0 && hr(),
      (a = e.pendingLanes),
      (a & 1) !== 0 ? (e === Yo ? oi++ : ((oi = 0), (Yo = e))) : (oi = 0),
      ln(),
      null
    );
  }
  function hr() {
    if (dn !== null) {
      var e = Gu(Ls),
        t = ht.transition,
        n = oe;
      try {
        if (((ht.transition = null), (oe = 16 > e ? 16 : e), dn === null))
          var s = !1;
        else {
          if (((e = dn), (dn = null), (Ls = 0), (te & 6) !== 0))
            throw Error(l(331));
          var o = te;
          for (te |= 4, x = e.current; x !== null; ) {
            var a = x,
              d = a.child;
            if ((x.flags & 16) !== 0) {
              var p = a.deletions;
              if (p !== null) {
                for (var m = 0; m < p.length; m++) {
                  var C = p[m];
                  for (x = C; x !== null; ) {
                    var T = x;
                    switch (T.tag) {
                      case 0:
                      case 11:
                      case 15:
                        ii(8, T, a);
                    }
                    var N = T.child;
                    if (N !== null) (N.return = T), (x = N);
                    else
                      for (; x !== null; ) {
                        T = x;
                        var k = T.sibling,
                          B = T.return;
                        if ((Fd(T), T === C)) {
                          x = null;
                          break;
                        }
                        if (k !== null) {
                          (k.return = B), (x = k);
                          break;
                        }
                        x = B;
                      }
                  }
                }
                var H = a.alternate;
                if (H !== null) {
                  var U = H.child;
                  if (U !== null) {
                    H.child = null;
                    do {
                      var Ce = U.sibling;
                      (U.sibling = null), (U = Ce);
                    } while (U !== null);
                  }
                }
                x = a;
              }
            }
            if ((a.subtreeFlags & 2064) !== 0 && d !== null)
              (d.return = a), (x = d);
            else
              e: for (; x !== null; ) {
                if (((a = x), (a.flags & 2048) !== 0))
                  switch (a.tag) {
                    case 0:
                    case 11:
                    case 15:
                      ii(9, a, a.return);
                  }
                var S = a.sibling;
                if (S !== null) {
                  (S.return = a.return), (x = S);
                  break e;
                }
                x = a.return;
              }
          }
          var v = e.current;
          for (x = v; x !== null; ) {
            d = x;
            var E = d.child;
            if ((d.subtreeFlags & 2064) !== 0 && E !== null)
              (E.return = d), (x = E);
            else
              e: for (d = v; x !== null; ) {
                if (((p = x), (p.flags & 2048) !== 0))
                  try {
                    switch (p.tag) {
                      case 0:
                      case 11:
                      case 15:
                        Cs(9, p);
                    }
                  } catch (G) {
                    Ee(p, p.return, G);
                  }
                if (p === d) {
                  x = null;
                  break e;
                }
                var I = p.sibling;
                if (I !== null) {
                  (I.return = p.return), (x = I);
                  break e;
                }
                x = p.return;
              }
          }
          if (
            ((te = o),
            ln(),
            Rt && typeof Rt.onPostCommitFiberRoot == "function")
          )
            try {
              Rt.onPostCommitFiberRoot(xi, e);
            } catch {}
          s = !0;
        }
        return s;
      } finally {
        (oe = n), (ht.transition = t);
      }
    }
    return !1;
  }
  function Jd(e, t, n) {
    (t = ur(n, t)),
      (t = vd(e, t, 1)),
      (e = an(e, t, 1)),
      (t = We()),
      e !== null && (Pr(e, 1, t), Qe(e, t));
  }
  function Ee(e, t, n) {
    if (e.tag === 3) Jd(e, e, n);
    else
      for (; t !== null; ) {
        if (t.tag === 3) {
          Jd(t, e, n);
          break;
        } else if (t.tag === 1) {
          var s = t.stateNode;
          if (
            typeof t.type.getDerivedStateFromError == "function" ||
            (typeof s.componentDidCatch == "function" &&
              (cn === null || !cn.has(s)))
          ) {
            (e = ur(n, e)),
              (e = yd(t, e, 1)),
              (t = an(t, e, 1)),
              (e = We()),
              t !== null && (Pr(t, 1, e), Qe(t, e));
            break;
          }
        }
        t = t.return;
      }
  }
  function ov(e, t, n) {
    var s = e.pingCache;
    s !== null && s.delete(t),
      (t = We()),
      (e.pingedLanes |= e.suspendedLanes & n),
      Pe === e &&
        (Be & n) === n &&
        (Re === 4 || (Re === 3 && (Be & 130023424) === Be && 500 > we() - bo)
          ? Pn(e, 0)
          : (zo |= n)),
      Qe(e, t);
  }
  function ef(e, t) {
    t === 0 &&
      ((e.mode & 1) === 0
        ? (t = 1)
        : ((t = Hi), (Hi <<= 1), (Hi & 130023424) === 0 && (Hi = 4194304)));
    var n = We();
    (e = Gt(e, t)), e !== null && (Pr(e, t, n), Qe(e, n));
  }
  function av(e) {
    var t = e.memoizedState,
      n = 0;
    t !== null && (n = t.retryLane), ef(e, n);
  }
  function uv(e, t) {
    var n = 0;
    switch (e.tag) {
      case 13:
        var s = e.stateNode,
          o = e.memoizedState;
        o !== null && (n = o.retryLane);
        break;
      case 19:
        s = e.stateNode;
        break;
      default:
        throw Error(l(314));
    }
    s !== null && s.delete(t), ef(e, n);
  }
  var tf;
  tf = function (e, t, n) {
    if (e !== null)
      if (e.memoizedProps !== t.pendingProps || Ve.current) Xe = !0;
      else {
        if ((e.lanes & n) === 0 && (t.flags & 128) === 0)
          return (Xe = !1), Qg(e, t, n);
        Xe = (e.flags & 131072) !== 0;
      }
    else (Xe = !1), ge && (t.flags & 1048576) !== 0 && Dc(t, ls, t.index);
    switch (((t.lanes = 0), t.tag)) {
      case 2:
        var s = t.type;
        Es(e, t), (e = t.pendingProps);
        var o = tr(t, xe.current);
        or(t, n), (o = So(null, t, s, e, o, n));
        var a = _o();
        return (
          (t.flags |= 1),
          typeof o == "object" &&
          o !== null &&
          typeof o.render == "function" &&
          o.$$typeof === void 0
            ? ((t.tag = 1),
              (t.memoizedState = null),
              (t.updateQueue = null),
              $e(s) ? ((a = !0), rs(t)) : (a = !1),
              (t.memoizedState =
                o.state !== null && o.state !== void 0 ? o.state : null),
              fo(t),
              (o.updater = Ss),
              (t.stateNode = o),
              (o._reactInternals = t),
              To(t, s, e, n),
              (t = Oo(null, t, s, !0, a, n)))
            : ((t.tag = 0), ge && a && to(t), be(null, t, o, n), (t = t.child)),
          t
        );
      case 16:
        s = t.elementType;
        e: {
          switch (
            (Es(e, t),
            (e = t.pendingProps),
            (o = s._init),
            (s = o(s._payload)),
            (t.type = s),
            (o = t.tag = dv(s)),
            (e = _t(s, e)),
            o)
          ) {
            case 0:
              t = No(null, t, s, e, n);
              break e;
            case 1:
              t = Rd(null, t, s, e, n);
              break e;
            case 11:
              t = wd(null, t, s, e, n);
              break e;
            case 14:
              t = Cd(null, t, s, _t(s.type, e), n);
              break e;
          }
          throw Error(l(306, s, ""));
        }
        return t;
      case 0:
        return (
          (s = t.type),
          (o = t.pendingProps),
          (o = t.elementType === s ? o : _t(s, o)),
          No(e, t, s, o, n)
        );
      case 1:
        return (
          (s = t.type),
          (o = t.pendingProps),
          (o = t.elementType === s ? o : _t(s, o)),
          Rd(e, t, s, o, n)
        );
      case 3:
        e: {
          if ((Ld(t), e === null)) throw Error(l(387));
          (s = t.pendingProps),
            (a = t.memoizedState),
            (o = a.element),
            Wc(e, t),
            fs(t, s, null, n);
          var d = t.memoizedState;
          if (((s = d.element), a.isDehydrated))
            if (
              ((a = {
                element: s,
                isDehydrated: !1,
                cache: d.cache,
                pendingSuspenseBoundaries: d.pendingSuspenseBoundaries,
                transitions: d.transitions,
              }),
              (t.updateQueue.baseState = a),
              (t.memoizedState = a),
              t.flags & 256)
            ) {
              (o = ur(Error(l(423)), t)), (t = Nd(e, t, s, n, o));
              break e;
            } else if (s !== o) {
              (o = ur(Error(l(424)), t)), (t = Nd(e, t, s, n, o));
              break e;
            } else
              for (
                it = nn(t.stateNode.containerInfo.firstChild),
                  rt = t,
                  ge = !0,
                  St = null,
                  n = zc(t, null, s, n),
                  t.child = n;
                n;

              )
                (n.flags = (n.flags & -3) | 4096), (n = n.sibling);
          else {
            if ((ir(), s === o)) {
              t = bt(e, t, n);
              break e;
            }
            be(e, t, s, n);
          }
          t = t.child;
        }
        return t;
      case 5:
        return (
          Vc(t),
          e === null && io(t),
          (s = t.type),
          (o = t.pendingProps),
          (a = e !== null ? e.memoizedProps : null),
          (d = o.children),
          Kl(s, o) ? (d = null) : a !== null && Kl(s, a) && (t.flags |= 32),
          Td(e, t),
          be(e, t, d, n),
          t.child
        );
      case 6:
        return e === null && io(t), null;
      case 13:
        return Od(e, t, n);
      case 4:
        return (
          ho(t, t.stateNode.containerInfo),
          (s = t.pendingProps),
          e === null ? (t.child = sr(t, null, s, n)) : be(e, t, s, n),
          t.child
        );
      case 11:
        return (
          (s = t.type),
          (o = t.pendingProps),
          (o = t.elementType === s ? o : _t(s, o)),
          wd(e, t, s, o, n)
        );
      case 7:
        return be(e, t, t.pendingProps, n), t.child;
      case 8:
        return be(e, t, t.pendingProps.children, n), t.child;
      case 12:
        return be(e, t, t.pendingProps.children, n), t.child;
      case 10:
        e: {
          if (
            ((s = t.type._context),
            (o = t.pendingProps),
            (a = t.memoizedProps),
            (d = o.value),
            de(us, s._currentValue),
            (s._currentValue = d),
            a !== null)
          )
            if (yt(a.value, d)) {
              if (a.children === o.children && !Ve.current) {
                t = bt(e, t, n);
                break e;
              }
            } else
              for (a = t.child, a !== null && (a.return = t); a !== null; ) {
                var p = a.dependencies;
                if (p !== null) {
                  d = a.child;
                  for (var m = p.firstContext; m !== null; ) {
                    if (m.context === s) {
                      if (a.tag === 1) {
                        (m = zt(-1, n & -n)), (m.tag = 2);
                        var C = a.updateQueue;
                        if (C !== null) {
                          C = C.shared;
                          var T = C.pending;
                          T === null
                            ? (m.next = m)
                            : ((m.next = T.next), (T.next = m)),
                            (C.pending = m);
                        }
                      }
                      (a.lanes |= n),
                        (m = a.alternate),
                        m !== null && (m.lanes |= n),
                        uo(a.return, n, t),
                        (p.lanes |= n);
                      break;
                    }
                    m = m.next;
                  }
                } else if (a.tag === 10) d = a.type === t.type ? null : a.child;
                else if (a.tag === 18) {
                  if (((d = a.return), d === null)) throw Error(l(341));
                  (d.lanes |= n),
                    (p = d.alternate),
                    p !== null && (p.lanes |= n),
                    uo(d, n, t),
                    (d = a.sibling);
                } else d = a.child;
                if (d !== null) d.return = a;
                else
                  for (d = a; d !== null; ) {
                    if (d === t) {
                      d = null;
                      break;
                    }
                    if (((a = d.sibling), a !== null)) {
                      (a.return = d.return), (d = a);
                      break;
                    }
                    d = d.return;
                  }
                a = d;
              }
          be(e, t, o.children, n), (t = t.child);
        }
        return t;
      case 9:
        return (
          (o = t.type),
          (s = t.pendingProps.children),
          or(t, n),
          (o = dt(o)),
          (s = s(o)),
          (t.flags |= 1),
          be(e, t, s, n),
          t.child
        );
      case 14:
        return (
          (s = t.type),
          (o = _t(s, t.pendingProps)),
          (o = _t(s.type, o)),
          Cd(e, t, s, o, n)
        );
      case 15:
        return kd(e, t, t.type, t.pendingProps, n);
      case 17:
        return (
          (s = t.type),
          (o = t.pendingProps),
          (o = t.elementType === s ? o : _t(s, o)),
          Es(e, t),
          (t.tag = 1),
          $e(s) ? ((e = !0), rs(t)) : (e = !1),
          or(t, n),
          md(t, s, o),
          To(t, s, o, n),
          Oo(null, t, s, !0, e, n)
        );
      case 19:
        return Id(e, t, n);
      case 22:
        return Ad(e, t, n);
    }
    throw Error(l(156, t.tag));
  };
  function nf(e, t) {
    return Bu(e, t);
  }
  function cv(e, t, n, s) {
    (this.tag = e),
      (this.key = n),
      (this.sibling =
        this.child =
        this.return =
        this.stateNode =
        this.type =
        this.elementType =
          null),
      (this.index = 0),
      (this.ref = null),
      (this.pendingProps = t),
      (this.dependencies =
        this.memoizedState =
        this.updateQueue =
        this.memoizedProps =
          null),
      (this.mode = s),
      (this.subtreeFlags = this.flags = 0),
      (this.deletions = null),
      (this.childLanes = this.lanes = 0),
      (this.alternate = null);
  }
  function pt(e, t, n, s) {
    return new cv(e, t, n, s);
  }
  function Qo(e) {
    return (e = e.prototype), !(!e || !e.isReactComponent);
  }
  function dv(e) {
    if (typeof e == "function") return Qo(e) ? 1 : 0;
    if (e != null) {
      if (((e = e.$$typeof), e === At)) return 11;
      if (e === Tt) return 14;
    }
    return 2;
  }
  function pn(e, t) {
    var n = e.alternate;
    return (
      n === null
        ? ((n = pt(e.tag, t, e.key, e.mode)),
          (n.elementType = e.elementType),
          (n.type = e.type),
          (n.stateNode = e.stateNode),
          (n.alternate = e),
          (e.alternate = n))
        : ((n.pendingProps = t),
          (n.type = e.type),
          (n.flags = 0),
          (n.subtreeFlags = 0),
          (n.deletions = null)),
      (n.flags = e.flags & 14680064),
      (n.childLanes = e.childLanes),
      (n.lanes = e.lanes),
      (n.child = e.child),
      (n.memoizedProps = e.memoizedProps),
      (n.memoizedState = e.memoizedState),
      (n.updateQueue = e.updateQueue),
      (t = e.dependencies),
      (n.dependencies =
        t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
      (n.sibling = e.sibling),
      (n.index = e.index),
      (n.ref = e.ref),
      n
    );
  }
  function Is(e, t, n, s, o, a) {
    var d = 2;
    if (((s = e), typeof e == "function")) Qo(e) && (d = 1);
    else if (typeof e == "string") d = 5;
    else
      e: switch (e) {
        case Ye:
          return Mn(n.children, o, a, t);
        case at:
          (d = 8), (o |= 8);
          break;
        case Kt:
          return (
            (e = pt(12, n, t, o | 2)), (e.elementType = Kt), (e.lanes = a), e
          );
        case et:
          return (e = pt(13, n, t, o)), (e.elementType = et), (e.lanes = a), e;
        case gt:
          return (e = pt(19, n, t, o)), (e.elementType = gt), (e.lanes = a), e;
        case _e:
          return Ms(n, o, a, t);
        default:
          if (typeof e == "object" && e !== null)
            switch (e.$$typeof) {
              case Bt:
                d = 10;
                break e;
              case _n:
                d = 9;
                break e;
              case At:
                d = 11;
                break e;
              case Tt:
                d = 14;
                break e;
              case je:
                (d = 16), (s = null);
                break e;
            }
          throw Error(l(130, e == null ? e : typeof e, ""));
      }
    return (
      (t = pt(d, n, t, o)), (t.elementType = e), (t.type = s), (t.lanes = a), t
    );
  }
  function Mn(e, t, n, s) {
    return (e = pt(7, e, s, t)), (e.lanes = n), e;
  }
  function Ms(e, t, n, s) {
    return (
      (e = pt(22, e, s, t)),
      (e.elementType = _e),
      (e.lanes = n),
      (e.stateNode = { isHidden: !1 }),
      e
    );
  }
  function Zo(e, t, n) {
    return (e = pt(6, e, null, t)), (e.lanes = n), e;
  }
  function qo(e, t, n) {
    return (
      (t = pt(4, e.children !== null ? e.children : [], e.key, t)),
      (t.lanes = n),
      (t.stateNode = {
        containerInfo: e.containerInfo,
        pendingChildren: null,
        implementation: e.implementation,
      }),
      t
    );
  }
  function fv(e, t, n, s, o) {
    (this.tag = t),
      (this.containerInfo = e),
      (this.finishedWork =
        this.pingCache =
        this.current =
        this.pendingChildren =
          null),
      (this.timeoutHandle = -1),
      (this.callbackNode = this.pendingContext = this.context = null),
      (this.callbackPriority = 0),
      (this.eventTimes = kl(0)),
      (this.expirationTimes = kl(-1)),
      (this.entangledLanes =
        this.finishedLanes =
        this.mutableReadLanes =
        this.expiredLanes =
        this.pingedLanes =
        this.suspendedLanes =
        this.pendingLanes =
          0),
      (this.entanglements = kl(0)),
      (this.identifierPrefix = s),
      (this.onRecoverableError = o),
      (this.mutableSourceEagerHydrationData = null);
  }
  function Jo(e, t, n, s, o, a, d, p, m) {
    return (
      (e = new fv(e, t, n, p, m)),
      t === 1 ? ((t = 1), a === !0 && (t |= 8)) : (t = 0),
      (a = pt(3, null, null, t)),
      (e.current = a),
      (a.stateNode = e),
      (a.memoizedState = {
        element: s,
        isDehydrated: n,
        cache: null,
        transitions: null,
        pendingSuspenseBoundaries: null,
      }),
      fo(a),
      e
    );
  }
  function hv(e, t, n) {
    var s =
      3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: ze,
      key: s == null ? null : "" + s,
      children: e,
      containerInfo: t,
      implementation: n,
    };
  }
  function rf(e) {
    if (!e) return sn;
    e = e._reactInternals;
    e: {
      if (En(e) !== e || e.tag !== 1) throw Error(l(170));
      var t = e;
      do {
        switch (t.tag) {
          case 3:
            t = t.stateNode.context;
            break e;
          case 1:
            if ($e(t.type)) {
              t = t.stateNode.__reactInternalMemoizedMergedChildContext;
              break e;
            }
        }
        t = t.return;
      } while (t !== null);
      throw Error(l(171));
    }
    if (e.tag === 1) {
      var n = e.type;
      if ($e(n)) return Pc(e, n, t);
    }
    return t;
  }
  function sf(e, t, n, s, o, a, d, p, m) {
    return (
      (e = Jo(n, s, !0, e, o, a, d, p, m)),
      (e.context = rf(null)),
      (n = e.current),
      (s = We()),
      (o = fn(n)),
      (a = zt(s, o)),
      (a.callback = t ?? null),
      an(n, a, o),
      (e.current.lanes = o),
      Pr(e, o, s),
      Qe(e, s),
      e
    );
  }
  function Ds(e, t, n, s) {
    var o = t.current,
      a = We(),
      d = fn(o);
    return (
      (n = rf(n)),
      t.context === null ? (t.context = n) : (t.pendingContext = n),
      (t = zt(a, d)),
      (t.payload = { element: e }),
      (s = s === void 0 ? null : s),
      s !== null && (t.callback = s),
      (e = an(o, t, d)),
      e !== null && (Ct(e, o, d, a), ds(e, o, d)),
      d
    );
  }
  function Bs(e) {
    return (
      (e = e.current), e.child ? (e.child.tag === 5, e.child.stateNode) : null
    );
  }
  function lf(e, t) {
    if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
      var n = e.retryLane;
      e.retryLane = n !== 0 && n < t ? n : t;
    }
  }
  function ea(e, t) {
    lf(e, t), (e = e.alternate) && lf(e, t);
  }
  function pv() {
    return null;
  }
  var of =
    typeof reportError == "function"
      ? reportError
      : function (e) {
          console.error(e);
        };
  function ta(e) {
    this._internalRoot = e;
  }
  (xs.prototype.render = ta.prototype.render =
    function (e) {
      var t = this._internalRoot;
      if (t === null) throw Error(l(409));
      Ds(e, t, null, null);
    }),
    (xs.prototype.unmount = ta.prototype.unmount =
      function () {
        var e = this._internalRoot;
        if (e !== null) {
          this._internalRoot = null;
          var t = e.containerInfo;
          On(function () {
            Ds(null, e, null, null);
          }),
            (t[xt] = null);
        }
      });
  function xs(e) {
    this._internalRoot = e;
  }
  xs.prototype.unstable_scheduleHydration = function (e) {
    if (e) {
      var t = Wu();
      e = { blockedOn: null, target: e, priority: t };
      for (var n = 0; n < Jt.length && t !== 0 && t < Jt[n].priority; n++);
      Jt.splice(n, 0, e), n === 0 && Vu(e);
    }
  };
  function na(e) {
    return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
  }
  function Fs(e) {
    return !(
      !e ||
      (e.nodeType !== 1 &&
        e.nodeType !== 9 &&
        e.nodeType !== 11 &&
        (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "))
    );
  }
  function af() {}
  function mv(e, t, n, s, o) {
    if (o) {
      if (typeof s == "function") {
        var a = s;
        s = function () {
          var C = Bs(d);
          a.call(C);
        };
      }
      var d = sf(t, s, e, 0, null, !1, !1, "", af);
      return (
        (e._reactRootContainer = d),
        (e[xt] = d.current),
        jr(e.nodeType === 8 ? e.parentNode : e),
        On(),
        d
      );
    }
    for (; (o = e.lastChild); ) e.removeChild(o);
    if (typeof s == "function") {
      var p = s;
      s = function () {
        var C = Bs(m);
        p.call(C);
      };
    }
    var m = Jo(e, 0, !1, null, null, !1, !1, "", af);
    return (
      (e._reactRootContainer = m),
      (e[xt] = m.current),
      jr(e.nodeType === 8 ? e.parentNode : e),
      On(function () {
        Ds(t, m, n, s);
      }),
      m
    );
  }
  function Hs(e, t, n, s, o) {
    var a = n._reactRootContainer;
    if (a) {
      var d = a;
      if (typeof o == "function") {
        var p = o;
        o = function () {
          var m = Bs(d);
          p.call(m);
        };
      }
      Ds(t, d, e, o);
    } else d = mv(n, t, e, o, s);
    return Bs(d);
  }
  (zu = function (e) {
    switch (e.tag) {
      case 3:
        var t = e.stateNode;
        if (t.current.memoizedState.isDehydrated) {
          var n = Or(t.pendingLanes);
          n !== 0 &&
            (Al(t, n | 1),
            Qe(t, we()),
            (te & 6) === 0 && ((fr = we() + 500), ln()));
        }
        break;
      case 13:
        On(function () {
          var s = Gt(e, 1);
          if (s !== null) {
            var o = We();
            Ct(s, e, 1, o);
          }
        }),
          ea(e, 1);
    }
  }),
    (Tl = function (e) {
      if (e.tag === 13) {
        var t = Gt(e, 134217728);
        if (t !== null) {
          var n = We();
          Ct(t, e, 134217728, n);
        }
        ea(e, 134217728);
      }
    }),
    (bu = function (e) {
      if (e.tag === 13) {
        var t = fn(e),
          n = Gt(e, t);
        if (n !== null) {
          var s = We();
          Ct(n, e, t, s);
        }
        ea(e, t);
      }
    }),
    (Wu = function () {
      return oe;
    }),
    (Yu = function (e, t) {
      var n = oe;
      try {
        return (oe = e), t();
      } finally {
        oe = n;
      }
    }),
    (yl = function (e, t, n) {
      switch (t) {
        case "input":
          if ((cl(e, n), (t = n.name), n.type === "radio" && t != null)) {
            for (n = e; n.parentNode; ) n = n.parentNode;
            for (
              n = n.querySelectorAll(
                "input[name=" + JSON.stringify("" + t) + '][type="radio"]',
              ),
                t = 0;
              t < n.length;
              t++
            ) {
              var s = n[t];
              if (s !== e && s.form === e.form) {
                var o = ts(s);
                if (!o) throw Error(l(90));
                pu(s), cl(s, o);
              }
            }
          }
          break;
        case "textarea":
          Su(e, n);
          break;
        case "select":
          (t = n.value), t != null && Wn(e, !!n.multiple, t, !1);
      }
    }),
    (Lu = $o),
    (Nu = On);
  var gv = { usingClientEntryPoint: !1, Events: [Xr, Jn, ts, Tu, Ru, $o] },
    ai = {
      findFiberByHostInstance: wn,
      bundleType: 0,
      version: "18.3.1",
      rendererPackageName: "react-dom",
    },
    vv = {
      bundleType: ai.bundleType,
      version: ai.version,
      rendererPackageName: ai.rendererPackageName,
      rendererConfig: ai.rendererConfig,
      overrideHookState: null,
      overrideHookStateDeletePath: null,
      overrideHookStateRenamePath: null,
      overrideProps: null,
      overridePropsDeletePath: null,
      overridePropsRenamePath: null,
      setErrorHandler: null,
      setSuspenseHandler: null,
      scheduleUpdate: null,
      currentDispatcherRef: se.ReactCurrentDispatcher,
      findHostInstanceByFiber: function (e) {
        return (e = Mu(e)), e === null ? null : e.stateNode;
      },
      findFiberByHostInstance: ai.findFiberByHostInstance || pv,
      findHostInstancesForRefresh: null,
      scheduleRefresh: null,
      scheduleRoot: null,
      setRefreshHandler: null,
      getCurrentFiber: null,
      reconcilerVersion: "18.3.1-next-f1338f8080-20240426",
    };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Us = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Us.isDisabled && Us.supportsFiber)
      try {
        (xi = Us.inject(vv)), (Rt = Us);
      } catch {}
  }
  return (
    (Ze.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = gv),
    (Ze.createPortal = function (e, t) {
      var n =
        2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
      if (!na(t)) throw Error(l(200));
      return hv(e, t, null, n);
    }),
    (Ze.createRoot = function (e, t) {
      if (!na(e)) throw Error(l(299));
      var n = !1,
        s = "",
        o = of;
      return (
        t != null &&
          (t.unstable_strictMode === !0 && (n = !0),
          t.identifierPrefix !== void 0 && (s = t.identifierPrefix),
          t.onRecoverableError !== void 0 && (o = t.onRecoverableError)),
        (t = Jo(e, 1, !1, null, null, n, !1, s, o)),
        (e[xt] = t.current),
        jr(e.nodeType === 8 ? e.parentNode : e),
        new ta(t)
      );
    }),
    (Ze.findDOMNode = function (e) {
      if (e == null) return null;
      if (e.nodeType === 1) return e;
      var t = e._reactInternals;
      if (t === void 0)
        throw typeof e.render == "function"
          ? Error(l(188))
          : ((e = Object.keys(e).join(",")), Error(l(268, e)));
      return (e = Mu(t)), (e = e === null ? null : e.stateNode), e;
    }),
    (Ze.flushSync = function (e) {
      return On(e);
    }),
    (Ze.hydrate = function (e, t, n) {
      if (!Fs(t)) throw Error(l(200));
      return Hs(null, e, t, !0, n);
    }),
    (Ze.hydrateRoot = function (e, t, n) {
      if (!na(e)) throw Error(l(405));
      var s = (n != null && n.hydratedSources) || null,
        o = !1,
        a = "",
        d = of;
      if (
        (n != null &&
          (n.unstable_strictMode === !0 && (o = !0),
          n.identifierPrefix !== void 0 && (a = n.identifierPrefix),
          n.onRecoverableError !== void 0 && (d = n.onRecoverableError)),
        (t = sf(t, null, e, 1, n ?? null, o, !1, a, d)),
        (e[xt] = t.current),
        jr(e),
        s)
      )
        for (e = 0; e < s.length; e++)
          (n = s[e]),
            (o = n._getVersion),
            (o = o(n._source)),
            t.mutableSourceEagerHydrationData == null
              ? (t.mutableSourceEagerHydrationData = [n, o])
              : t.mutableSourceEagerHydrationData.push(n, o);
      return new xs(t);
    }),
    (Ze.render = function (e, t, n) {
      if (!Fs(t)) throw Error(l(200));
      return Hs(null, e, t, !1, n);
    }),
    (Ze.unmountComponentAtNode = function (e) {
      if (!Fs(e)) throw Error(l(40));
      return e._reactRootContainer
        ? (On(function () {
            Hs(null, null, e, !1, function () {
              (e._reactRootContainer = null), (e[xt] = null);
            });
          }),
          !0)
        : !1;
    }),
    (Ze.unstable_batchedUpdates = $o),
    (Ze.unstable_renderSubtreeIntoContainer = function (e, t, n, s) {
      if (!Fs(n)) throw Error(l(200));
      if (e == null || e._reactInternals === void 0) throw Error(l(38));
      return Hs(e, t, n, !1, s);
    }),
    (Ze.version = "18.3.1-next-f1338f8080-20240426"),
    Ze
  );
}
var vf;
function Rv() {
  if (vf) return sa.exports;
  vf = 1;
  function r() {
    if (
      !(
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
      )
    )
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(r);
      } catch (i) {
        console.error(i);
      }
  }
  return r(), (sa.exports = Tv()), sa.exports;
}
var yf;
function Lv() {
  if (yf) return Gs;
  yf = 1;
  var r = Rv();
  return (Gs.createRoot = r.createRoot), (Gs.hydrateRoot = r.hydrateRoot), Gs;
}
var Nv = Lv();
function Mv(r) {
  typeof reportError == "function" ? reportError(r) : console.error(r);
}
function Me(r, i) {
  let l = r;
  const u = new Set();
  return {
    publish(c) {
      if (!i?.(l, c)) {
        l = c;
        for (const f of u)
          try {
            f();
          } catch (h) {
            Mv(h);
          }
      }
    },
    getSnapshot() {
      return l;
    },
    subscribe(c) {
      return u.add(c), () => u.delete(c);
    },
  };
}
function Dv(r, i) {
  return (
    r.state === i.state && r.score === i.score && r.bestScore === i.bestScore
  );
}
const Mt = Me({ state: "getready", score: 0, bestScore: 0 }, Dv);
function Bv(r) {
  const i = () => setTimeout(r, 0);
  document.readyState === "complete"
    ? i()
    : window.addEventListener("load", i, { once: !0 });
}
function xv(r) {
  if (Mt.getSnapshot().state !== "play") {
    r();
    return;
  }
  const i = Mt.subscribe(() => {
    Mt.getSnapshot().state !== "play" && (i(), r());
  });
}
function sl(r, i = Bv) {
  i(() => xv(r));
}
const Se = {
    gravity: 5,
    flapVelocity: 1.55,
    flapVelocityV3: 1.4,
    fallCapV3: 1.5,
    fallCapV4: 2.2,
    lowestHeight: -0.975,
    radius: 0.068,
    displacement: 0.01,
    speed: 0.6,
    startX: 1.2,
    endX: -1.2,
    pipeGap: 0.47,
    openingPipeGaps: [0.62, 0.59, 0.56, 0.53, 0.5],
    pipeSpacing: 1,
    pipeMinY: -0.2,
    pipeMaxY: 0.8,
  },
  Sn = 1 << 20,
  Ja = 120,
  zn = 1 / Ja,
  Vv = 180;
function Ne(r) {
  return Math.round(r * Sn);
}
function Vt(r) {
  return r / Sn;
}
function Uh(r) {
  return Math.trunc(r / Ja);
}
const $v = Uh(Ne(Se.gravity)),
  Xv = Ne(Se.flapVelocity),
  Kv = Ne(Se.flapVelocityV3),
  Qv = Ne(Se.fallCapV3),
  Zv = Ne(Se.fallCapV4),
  Gh = Ne(Se.lowestHeight),
  Ci = Ne(Se.radius),
  qv = Ne(Se.displacement),
  Jv = Ne(Se.speed),
  Si = Uh(Jv),
  _f = Ne(Se.startX),
  e0 = Ne(Se.endX),
  t0 = Ne(Se.pipeGap),
  Ef = Math.trunc(t0 / 2),
  wf = Se.openingPipeGaps.map((r) => Math.trunc(Ne(r) / 2)),
  Ba = 4;
function aa(r) {
  return r < 3 ? Xv : Kv;
}
function n0(r) {
  return r < 3 ? null : r < 4 ? Qv : Zv;
}
const r0 = Ne(Se.pipeSpacing),
  zh = Ne(Se.pipeMinY),
  i0 = Ne(Se.pipeMaxY),
  s0 = i0 - zh,
  l0 = 26 * qv,
  Cf = Math.trunc(l0 / 2),
  kf = Ci * Ci;
function o0(r, i) {
  return r < 2 ? Ef : i < wf.length ? wf[i] : Ef;
}
function qe(r) {
  return fe.useSyncExternalStore(r.subscribe, r.getSnapshot);
}
const Vh = "flappy_muted";
function C0() {
  return String(__ls.getItem(Vh)) === "true";
}
function k0(r) {
  __ls.setItem(Vh, String(r));
}
const zs = Me(C0()),
  ki = {
    getSnapshot: zs.getSnapshot,
    subscribe: zs.subscribe,
    toggleMuted() {
      const r = !zs.getSnapshot();
      k0(r), zs.publish(r);
    },
  };
const Lf = Se.displacement,
  $h = (r, i, l, u) => ({
    worldW: r * Lf,
    worldH: i * Lf,
    anchor: { x: l, y: u },
  }),
  ae = (r, i, l, u = 0.5, c = 0.5) => ({
    source: { kind: "atlas", frame: r },
    ...$h(i, l, u, c),
  }),
  ci = (r, i, l, u = 0.5, c = 0.5) => ({
    source: { kind: "image", src: r },
    ...$h(i, l, u, c),
  }),
  ue = {
    background: ae("bg", 144, 256, 0.5, 0.5),
    cityline: ae("cityline", 144, 110, 0.5, 0),
    ground: ae("ground", 144, 53, 0.5, 1),
    pipeUp: ae("pipe_new", 26, 160, 0.5, 1),
    pipeDown: ae("pipe_new", 26, 160, 0.5, 1),
    bird0: ci("/sprites/bird-upflap.png", 17, 12, 0.5, 0.5),
    bird1: ci("/sprites/bird-midflap.png", 17, 12, 0.5, 0.5),
    bird2: ci("/sprites/bird-downflap.png", 17, 12, 0.5, 0.5),
    message: ci("/sprites/message.png", 92, 133.5, 0.5, 0.5),
    buttonGreen: ae("button-green", 62, 20, 0.5, 0.5),
    buttonBlue: ae("button-blue", 62, 20, 0.5, 0.5),
    buttonYellow: ae("button-yellow", 62, 20, 0.5, 0.5),
    buttonGray: ae("button-gray", 62, 20, 0.5, 0.5),
    soundOn: ci("/sprites/sound-on.png", 14, 12, 0.5, 0.5),
    soundOff: ci("/sprites/sound-off.png", 14, 12, 0.5, 0.5),
    number0: ci("/sprites/number-0.png", 24, 36, 0.5, 0.5),
    number1: ci("/sprites/number-1.png", 16, 36, 0.5, 0.5),
    number2: ci("/sprites/number-2.png", 24, 36, 0.5, 0.5),
    number3: ci("/sprites/number-3.png", 24, 36, 0.5, 0.5),
    number4: ci("/sprites/number-4.png", 24, 36, 0.5, 0.5),
    number5: ci("/sprites/number-5.png", 24, 36, 0.5, 0.5),
    number6: ci("/sprites/number-6.png", 24, 36, 0.5, 0.5),
    number7: ci("/sprites/number-7.png", 24, 36, 0.5, 0.5),
    number8: ci("/sprites/number-8.png", 24, 36, 0.5, 0.5),
    number9: ci("/sprites/number-9.png", 24, 36, 0.5, 0.5),
    gameOver: ae("game-over", 100, 18.3, 0.5, 0.5),
    newBadge: ae("new-badge", 18, 8, 0.5, 0.5),
    panelOutside: ae("panel-outside", 110, 128.9, 0.5, 0.5),
    panelInside: ae("panel-inside", 99.3, 62.6, 0.5, 0.5),
    medalEmpty: ae("medal-empty", 22, 22, 0.5, 0.5),
    medalBronze: ae("medal-bronze", 22, 22, 0.5, 0.5),
    medalSilver: ae("medal-silver", 22, 22, 0.5, 0.5),
    medalGold: ae("medal-gold", 22, 22, 0.5, 0.5),
    medalPlatinum: ae("medal-platinum", 22, 22, 0.5, 0.5),
  },
  ru = ["bird0", "bird1", "bird2"],
  Nf = "/assets/atlas-D7zSkRSP.webp",
  R0 = {
    bg: { x: 4, y: 4, w: 1440, h: 2560 },
    "button-blue": { x: 2568, y: 1112, w: 520, h: 168 },
    "button-gray": { x: 3096, y: 1112, w: 520, h: 168 },
    "button-green": { x: 3120, y: 1856, w: 520, h: 168 },
    "button-yellow": { x: 3233, y: 2342, w: 520, h: 168 },
    cityline: { x: 2568, y: 4, w: 1440, h: 1100 },
    "game-over": { x: 2136, y: 2342, w: 1089, h: 199 },
    ground: { x: 1012, y: 2572, w: 1440, h: 530 },
    "medal-bronze": { x: 3616, y: 2056, w: 220, h: 220 },
    "medal-empty": { x: 3844, y: 2056, w: 220, h: 220 },
    "medal-gold": { x: 1452, y: 2342, w: 220, h: 220 },
    "medal-platinum": { x: 1680, y: 2342, w: 220, h: 220 },
    "medal-silver": { x: 1908, y: 2342, w: 220, h: 220 },
    "new-badge": { x: 3262, y: 2572, w: 206, h: 92 },
    "panel-inside": { x: 4, y: 2572, w: 1e3, h: 630 },
    "panel-outside": { x: 1452, y: 4, w: 1108, h: 1298 },
    pipe_new: { x: 1452, y: 1310, w: 206, h: 1024 },
    scoreboard: { x: 1666, y: 1310, w: 1446, h: 738 },
  },
  Of = (r) =>
    new Promise((i, l) => {
      const u = new Image();
      (u.onload = () => i(u)),
        (u.onerror = () => l(new Error(`Failed to load ${r}`))),
        (u.src = r);
    }),
  ua = async (r) => {
    if (typeof createImageBitmap != "function") return Of(r);
    try {
      const i = await (await fetch(r)).blob();
      return await createImageBitmap(i);
    } catch {
      return Of(r);
    }
  },
  Pf = (r) => ({
    image: r,
    sx: 0,
    sy: 0,
    sw: ("naturalWidth" in r && r.naturalWidth) || r.width,
    sh: ("naturalHeight" in r && r.naturalHeight) || r.height,
  }),
  If = 0.1,
  Mf = 0.002;
class L0 {
  images = new Map();
  themeOverrides = new Map();
  tintCache = new Map();
  themeToken = 0;
  loaded = !1;
  async loadAll() {
    const l = new FontFace("Jersey10", "url(/fonts/Jersey10-Regular.woff2)")
        .load()
        .then((h) => {
          document.fonts.add(h);
        })
        .catch((h) => {
          console.warn(
            "Failed to load Jersey10 font, falling back to sans-serif",
            h,
          );
        }),
      u = Object.entries(ue),
      c = ua(Nf)
        .then((h) => {
          for (const [g, _] of u) {
            if (_.source.kind !== "atlas") continue;
            const w = R0[_.source.frame];
            this.images.set(g, {
              image: h,
              sx: w.x,
              sy: w.y,
              sw: w.w,
              sh: w.h,
            });
          }
        })
        .catch(() => {
          console.error(`Failed to load sprite atlas: ${Nf}`);
        }),
      f = u
        .filter(([, h]) => h.source.kind === "image")
        .map(([h, g]) =>
          ua(g.source.src)
            .then((_) => {
              this.images.set(h, Pf(_));
            })
            .catch(() => {
              console.error(`Failed to load sprite: ${h}`);
            }),
        );
    await Promise.all([c, ...f, l]), (this.loaded = !0);
  }
  isLoaded() {
    return this.loaded;
  }
  async applyTheme(i, l = ua) {
    const u = ++this.themeToken,
      c = Object.entries(i),
      f = await Promise.all(
        c.map(async ([h, g]) => {
          try {
            const _ = await l(g);
            return { name: h, img: _ };
          } catch {
            return console.error(`Failed to load theme override: ${g}`), null;
          }
        }),
      );
    if (this.themeToken === u) {
      this.themeOverrides.clear();
      for (const h of f) h && this.themeOverrides.set(h.name, h.img);
    }
  }
  clearTheme() {
    this.themeToken++, this.themeOverrides.clear();
  }
  drawSprite(i, l, u, c, f = {}) {
    if (!this.loaded) return;
    const h = this.resolveRegion(l);
    if (!h) return;
    const g = ue[l],
      { rot: _ = 0, scale: w = 1, flipX: O = !1, flipY: R = !1, tint: L } = f,
      {
        image: z,
        sx: Q,
        sy: X,
        sw: b,
        sh: ee,
      } = L ? this.getTinted(l, h, L) : h;
    i.save(), i.translate(u, c), i.rotate(_);
    const M = w * (O ? -1 : 1),
      J = -w * (R ? -1 : 1);
    i.scale(M, J);
    const se = -g.worldW * g.anchor.x,
      Ae = -g.worldH * (1 - g.anchor.y);
    i.drawImage(z, Q, X, b, ee, se, Ae, g.worldW, g.worldH), i.restore();
  }
  drawStretchedSprite(i, l, u, c, f) {
    if (!this.loaded) return;
    const h = this.resolveRegion(l);
    if (!h) return;
    const g = ue[l],
      { scale: _ = 1, tint: w } = f,
      {
        image: O,
        sx: R,
        sy: L,
        sw: z,
        sh: Q,
      } = w ? this.getTinted(l, h, w) : h,
      X = z * If,
      b = g.worldW * If * _,
      ee = Math.max(f.width, b * 2),
      M = g.worldH * _,
      J = -ee * g.anchor.x,
      se = -M * (1 - g.anchor.y),
      Ae = ee - b * 2;
    i.save(),
      i.translate(u, c),
      i.scale(1, -1),
      i.drawImage(O, R, L, X, Q, J, se, b, M),
      i.drawImage(O, R + X, L, z - X * 2, Q, J + b - Mf, se, Ae + Mf * 2, M),
      i.drawImage(O, R + z - X, L, X, Q, J + ee - b, se, b, M),
      i.restore();
  }
  fillPipeShaft(i, l, u, c, f) {
    if (!this.loaded || f <= c) return;
    const h = this.resolveRegion(l);
    if (!h) return;
    const g = ue[l];
    i.drawImage(
      h.image,
      h.sx,
      h.sy + h.sh - 1,
      h.sw,
      1,
      u - g.worldW * g.anchor.x,
      c,
      g.worldW,
      f - c,
    );
  }
  resolveRegion(i) {
    const l = this.themeOverrides.get(i);
    return l ? Pf(l) : this.images.get(i);
  }
  getTinted(i, l, u) {
    const c = `${i}:${u}`,
      f = this.tintCache.get(c);
    if (f) return f;
    const h = document.createElement("canvas");
    (h.width = l.sw), (h.height = l.sh);
    const g = h.getContext("2d");
    if (!g) return l;
    g.drawImage(l.image, l.sx, l.sy, l.sw, l.sh, 0, 0, l.sw, l.sh),
      (g.globalCompositeOperation = "multiply"),
      (g.fillStyle = u),
      g.fillRect(0, 0, l.sw, l.sh),
      (g.globalCompositeOperation = "destination-in"),
      g.drawImage(l.image, l.sx, l.sy, l.sw, l.sh, 0, 0, l.sw, l.sh);
    const _ = { image: h, sx: 0, sy: 0, sw: l.sw, sh: l.sh };
    return this.tintCache.set(c, _), _;
  }
}
const N0 = Se.startX - ue.pipeUp.worldW / 2,
  O0 = 0.02,
  P0 = 0.33;
function Xh(r) {
  return Math.min(Math.max(N0 - r / 2 - O0, 0), P0);
}
const I0 = 0.25,
  M0 = "#d8a96b",
  D0 = 0.21,
  B0 = 0.5,
  Df = 1.15,
  x0 = 0.15,
  F0 = 0.01;
function H0(r, i, l, u, c) {
  G0(r, i, u, c);
  const f = Xh(u);
  r.save(),
    r.translate(-f, 0),
    z0(r, i, l.scrollX, u),
    b0(r, i, l.pipes, c),
    W0(r, i, l.scrollX, u),
    l.state !== "getready" &&
      i.drawSprite(r, ru[l.birdFrame], 0, l.birdY, { rot: l.birdRot }),
    r.restore();
}
function G0(r, i, l, u) {
  const c = Math.max(l / ue.background.worldW, u / ue.background.worldH);
  i.drawSprite(r, "background", 0, 0, { scale: c });
}
function z0(r, i, l, u) {
  const c = ue.cityline.worldW * Df,
    f = c - F0,
    h = (l * B0) % f,
    g = -u / 2 - h + c / 2,
    _ = Math.ceil(u / f) + 2,
    w = Se.lowestHeight - x0;
  for (let O = 0; O < _; O++)
    i.drawSprite(r, "cityline", g + O * f, w, { scale: Df });
}
function b0(r, i, l, u) {
  const c = ue.pipeUp.worldH,
    f = u / 2,
    h = -u / 2;
  for (const g of l) {
    const _ = g.gapY - g.halfGap,
      w = g.gapY + g.halfGap;
    i.fillPipeShaft(r, "pipeUp", g.x, h, _ - c),
      i.drawSprite(r, "pipeUp", g.x, _),
      i.fillPipeShaft(r, "pipeDown", g.x, w + c, f),
      i.drawSprite(r, "pipeDown", g.x, w, { flipY: !0 });
  }
}
function W0(r, i, l, u) {
  const c = ue.ground.worldW,
    f = l % c,
    h = Se.lowestHeight + D0,
    g = -u / 2 - f,
    _ = Math.ceil(u / c) + 2;
  (r.fillStyle = M0), r.fillRect(-10, Se.lowestHeight, 20, -10);
  for (let w = 0; w < _; w++) i.drawSprite(r, "ground", g + w * c, h);
}
const su = "Jersey10, sans-serif",
  Un = 100;
function ot(r, i, l) {
  r.save(), (r.font = `${Un}px ${su}`);
  const u = r.measureText(i).width;
  return r.restore(), u * (l / Un);
}
function Ai(r, i, l) {
  r.save(), (r.font = `${Un}px ${su}`), (r.textAlign = "center");
  const u = r.measureText(i);
  return (
    r.restore(),
    ((u.actualBoundingBoxRight - u.actualBoundingBoxLeft) / 2) * (l / Un)
  );
}
function $(r, i, l, u, c, f, h) {
  const g = c / Un;
  r.save(),
    r.translate(l, u),
    r.scale(g, -g),
    (r.font = `${Un}px ${su}`),
    (r.textAlign = f),
    (r.textBaseline = "middle"),
    h
      ? ((r.fillStyle = h), r.fillText(i, 0, 0))
      : ((r.strokeStyle = "black"),
        (r.lineWidth = Un * 0.15),
        (r.lineJoin = "round"),
        r.strokeText(i, 0, 0),
        (r.fillStyle = "white"),
        r.fillText(i, 0, 0)),
    r.restore();
}
const $t = 0.52,
  Ge = 0.2,
  j0 = {
    green: "buttonGreen",
    blue: "buttonBlue",
    yellow: "buttonYellow",
    gray: "buttonGray",
  },
  ca = 0.12,
  V0 = 0.08;
function Ti(r, i, l, u, c, f = $t) {
  const h = j0[l];
  i.drawStretchedSprite(r, h, u, c, { width: f, scale: Ge / ue[h].worldH });
}
function $0(r, i, l = $t) {
  const u = l - V0,
    c = ot(r, i, ca);
  return c <= u ? ca : (ca * u) / c;
}
function mr(r, i, l, u, c, f, h = $t) {
  Ti(r, i, l, c, f, h);
  const g = $0(r, u, h);
  $(r, u, c - Ai(r, u, g), f, g, "center");
}
const Ni = 1,
  Gn = 5,
  X0 = 1.7,
  K0 = 0.1,
  Zh = -0.62 / 2,
  xa = ($t + K0) / 2,
  Q0 = 0.32;
function Sr(r) {
  return r - Q0;
}
const qh = -0.61,
  Z0 = 0.09,
  Bf = 0.06,
  xf = ue.panelOutside.worldW,
  Jh = ue.panelOutside.worldH,
  ep = ue.gameOver.worldH,
  Ff = 0.1,
  q0 = 0.075,
  J0 = -0.76,
  da = 0.15,
  ey = 0.04,
  ty = 0.07,
  Hf = 0.08,
  ny = 0.05,
  ry = 0.8,
  iy = 0.03;
function sy(r) {
  return r < X0;
}
function ly() {
  return {
    narrow: !0,
    panelScale: 1,
    panelOffsetX: 0,
    panelY: Ff,
    titleY: Ff + Jh / 2 + q0 + ep / 2,
    buttonY: J0,
  };
}
function oy(r) {
  const i = Math.min(ry, (r - 2 * ny - Hf) / (2 * xf)),
    l = (Jh * i) / 2;
  return {
    narrow: !1,
    panelScale: i,
    panelOffsetX: (xf * i + Hf) / 2,
    panelY: da,
    titleY: da + l + ey + ep / 2,
    buttonY: da - l - ty - Ge / 2,
  };
}
function ay(r, i) {
  const l = Sr(r.buttonY) - Ge / 2,
    u = Math.max(0, i + iy - l);
  return u === 0
    ? r
    : {
        ...r,
        panelY: r.panelY + u,
        titleY: r.titleY + u,
        buttonY: r.buttonY + u,
      };
}
function lu(r, i) {
  const l = sy(r) ? ly() : oy(r);
  return ay(l, i);
}
const fy = 0.35,
  hy = 0.3,
  ap = 1.2;
function up(r) {
  return Math.min(1, Math.max(0, r / fy));
}
function py(r) {
  return up(r - hy);
}
function my(r) {
  return up(r - ap);
}
const Zs = 0.05,
  Gf = 0.3;
class vy {
  page = 0;
  dragX = 0;
  dragging = !1;
  startX = 0;
  startY = 0;
  exceededSlop = !1;
  beginDrag(i, l) {
    (this.dragging = !0),
      (this.startX = i),
      (this.startY = l),
      (this.dragX = 0),
      (this.exceededSlop = !1);
  }
  moveDrag(i, l) {
    this.dragging &&
      ((this.dragX = i - this.startX),
      (Math.abs(i - this.startX) > Zs || Math.abs(l - this.startY) > Zs) &&
        (this.exceededSlop = !0));
  }
  endDrag(i, l) {
    if (!this.dragging) return !1;
    this.moveDrag(i, l), (this.dragging = !1);
    const u = !this.exceededSlop;
    return (
      u ||
        (this.dragX <= -Gf
          ? this.setPage(this.page + 1)
          : this.dragX >= Gf && this.setPage(this.page - 1)),
      (this.dragX = 0),
      u
    );
  }
  cancelDrag() {
    (this.dragging = !1), (this.dragX = 0);
  }
  setPage(i) {
    this.page = Math.max(0, Math.min(Ni - 1, i));
  }
  reset() {
    this.cancelDrag(), (this.page = 0);
  }
}
function vr(r, i, l, u, c, f) {
  return r >= l - c / 2 && r <= l + c / 2 && i >= u - f / 2 && i <= u + f / 2;
}
function _y(r, i, l) {
  return vr(r, i, 0, l.buttonY, $t, Ge)
    ? { kind: "play" }
    : vr(r, i, 0, Sr(l.buttonY), vW, Ge)
      ? { kind: "revive" }
      : null;
}
const Ha = 0.08,
  hp = 0.12,
  sp = 0.2,
  Ty = 0.72,
  Ry = 0.22,
  pp = 0.34,
  Ly = 0.28,
  bf = 0.22;
function Oy(r, i, l, u) {
  const c = l / 2,
    f = u / 2 - sp;
  return r <= c && r >= c - Ly && i <= f + bf / 2 && i >= f - bf / 2;
}
const Qf = "PLAY",
  mS = "REVIVE ONCE",
  gS = "ALREADY REVIVED",
  vW = 0.72,
  vS = "rgba(0, 0, 0, 0.6)",
  ga = 0.075,
  CS = 0.27,
  pr = 0.25,
  Zf = 0.4,
  qf = 0.2,
  AS = 0.21,
  TS = 0.245,
  RS = 0.17,
  LS = 0.08,
  NS = -0.17,
  OS = 0.09,
  PS = 0.18,
  Jf = -0.33,
  XS = {
    bronze: "medalBronze",
    silver: "medalSilver",
    gold: "medalGold",
    platinum: "medalPlatinum",
  };
function KS(r, i, l, u, c, f, h) {
  const g = lu(u, f);
  r.save();
  const _ = py(l.stateElapsed);
  _ < 1 && (r.globalAlpha = _),
    (r.fillStyle = vS),
    r.fillRect(-u / 2, -c / 2, u, c),
    i.drawSprite(r, "gameOver", 0, g.titleY),
    JS(r, i, l, g, h);
  const w = my(l.stateElapsed);
  w > 0 &&
    (r.save(),
    w < 1 && (r.globalAlpha = w),
    QS(r, i, g.buttonY, h),
    r.restore()),
    r.restore();
}
function QS(r, i, l, u) {
  mr(r, i, "green", Qf, 0, l),
    mr(r, i, u ? "yellow" : "gray", u ? mS : gS, 0, Sr(l), vW);
}
function JS(r, i, l, u, c) {
  el(r, 0, u, () => kp(r, i, l, c));
}
function el(r, i, l, u) {
  r.save(),
    r.translate(i, l.panelY),
    r.scale(l.panelScale, l.panelScale),
    u(),
    r.restore();
}
function kp(r, i, l) {
  i.drawSprite(r, "panelOutside", 0, 0),
    i.drawSprite(r, "panelInside", 0, CS),
    nu(r, i, l.score, -pr, Zf, 0.129, "center"),
    $(r, "SCORE", -pr, AS, ga, "center"),
    nu(r, i, l.bestScore, pr, Zf, 0.129, "center"),
    $(r, "HIGHEST", pr, TS, ga, "center"),
    $(r, "SCORE", pr, RS, ga, "center"),
    l.isNewBest && i.drawSprite(r, "newBadge", pr, LS),
    $(r, "MEDAL", NS, Jf, OS, "center");
  const u = l.medal ? XS[l.medal] : "medalEmpty";
  i.drawSprite(r, u, PS, Jf);
}
const T_ = 0.13,
  R_ = 0.06,
  L_ = 0.14,
  N_ = 0.25,
  O_ = 1.1,
  dgH = 0.17,
  dgKeep = 0.25,
  msgY = 0.31,
  creditY = -1.16,
  creditSize = 0.05;
function dgY(r) {
  // Layout guard: the in-game score may never sit higher than three quarters of
  // the viewport height (measured from the bottom edge), i.e. the top of the
  // glyphs stays at or below the top quarter of the screen. r (= frameH) spans
  // the whole viewport height, so that limit is dgKeep * r in world units.
  return Math.min(O_, dgKeep * r - dgH / 2);
}
function j_(r, i, l, u, c, f, g, h) {
  l.state === "getready"
    ? Z_(r, i, l, u, c, g)
    : l.state === "play"
      ? nu(r, i, l.score, 0, dgY(c), dgH, "center")
      : l.state === "gameover" && KS(r, i, l, u, c, f, h);
}
function Z_(r, i, l, u, c, f) {
  // original Flappy Bird home-screen artwork: logo + "Get Ready!" + tap hint,
  // drawn at the original scale (1 artwork px = 0.005 world units, i.e. 267/512
  // of the frame height) and 12% below the frame top, exactly like the original
  i.drawSprite(r, "message", 0, msgY),
    q_(r, i, l.bestScore, u, c, f),
    // home screen only: a credit line just above the bottom edge
    $(r, "Made with love by lingyicute", 0, creditY, creditSize, "center");
}
function q_(r, i, l, u, c, f) {
  const h = c / 2 - hp,
    g = u / 2 - Ha,
    _ = -u / 2 + Ha;
  $(r, "HIGHEST SCORE", _, h, R_, "left"),
    nu(r, i, l, _, h - L_, 0.09, "left"),
    i.drawSprite(r, f ? "soundOff" : "soundOn", g - ue.soundOn.worldW / 2, c / 2 - sp);
}
const J_ = Ne(-10),
  eE = Ne(10);
function tE(r) {
  return r - Ci < Gh;
}
function nE(r, i) {
  const l = i.x - Cf,
    u = i.x + Cf,
    f = -Math.max(l, Math.min(0, u));
  if (Math.abs(f) >= Ci) return null;
  const h = i.gapY - i.halfGap,
    g = Math.max(J_, Math.min(r, h)),
    _ = r - g;
  if (f * f + _ * _ < kf) return "bottom";
  const w = i.gapY + i.halfGap,
    O = Math.max(w, Math.min(r, eE)),
    R = r - O;
  return f * f + R * R < kf ? "top" : null;
}
const di = (1n << 64n) - 1n,
  rE = 0x9e3779b97f4a7c15n,
  iE = 0xbf58476d1ce4e5b9n,
  sE = 0x94d049bb133111ebn,
  lE = BigInt(Sn);
class ba {
  state;
  constructor(i) {
    this.state = i & di;
  }
  nextU64() {
    this.state = (this.state + rE) & di;
    let i = this.state;
    return (
      (i = ((i ^ (i >> 30n)) * iE) & di),
      (i = ((i ^ (i >> 27n)) * sE) & di),
      (i = i ^ (i >> 31n)),
      i & di
    );
  }
  nextFraction() {
    return Number(this.nextU64() % lE);
  }
  nextGapY() {
    return zh + Math.trunc((this.nextFraction() * s0) / Sn);
  }
}
const dE = 0.05,
  fE = 5,
  hE = 0.15,
  Sa = Math.PI / 8,
  pE = 0.5,
  mE = -Math.PI / 2,
  // nose-down spin while crashing: 8 deg per frame at 30 fps (= 240 deg/s)
  // converted to the 120 Hz simulation step
  crashSpin = 0.0349;
function _a(r, i, l) {
  return r + (i - r) * l;
}
const oh = (1n << 53n) - 1n;
function gE() {
  if (typeof crypto < "u" && crypto.getRandomValues) {
    const r = new BigUint64Array(1);
    return crypto.getRandomValues(r), r[0] & oh;
  }
  return BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) & oh;
}
class au {
  currentState = "getready";
  birdY = 0;
  birdVy = 0;
  birdRot = 0;
  birdGrounded = !1;
  pipes = [];
  scrollX = 0;
  score = 0;
  bestScore;
  elapsed = 0;
  stateEnteredElapsed = 0;
  animationTimer = 0;
  isNewBest = !1;
  pipeScroll = 0;
  prevBirdY = 0;
  prevBirdRot = 0;
  prevScrollX = 0;
  prevPipeScroll = 0;
  nextSeed = null;
  runSeed = 0n;
  simVersion = Ba;
  spawnCount = 0;
  prng = new ba(0n);
  playStep = 0;
  flaps = [];
  passSteps = [];
  pendingPasses = 0;
  revivedAtStep = null;
  deathCause = null;
  soundListeners = new Set();
  bestScoreListeners = new Set();
  constructor(i = 0) {
    this.bestScore = i;
  }
  onSound(i) {
    return this.soundListeners.add(i), () => this.soundListeners.delete(i);
  }
  onBestScoreChanged(i) {
    return (
      this.bestScoreListeners.add(i), () => this.bestScoreListeners.delete(i)
    );
  }
  seedPipes(i, l = Ba) {
    (this.nextSeed = i), (this.simVersion = l);
  }
  get flapTrace() {
    return this.flaps;
  }
  get passStepTrace() {
    return this.passSteps;
  }
  get wasRevived() {
    return this.revivedAtStep !== null;
  }
  get runDeathCause() {
    return this.deathCause;
  }
  get durationSteps() {
    return this.playStep;
  }
  get currentSeed() {
    return this.runSeed;
  }
  get runSimVersion() {
    return this.simVersion;
  }
  restart() {
    this.currentState === "gameover" &&
      (this.emitSound("swoosh"), this.reset(), this.transition("getready"));
  }
  revive() {
    this.currentState !== "gameover" ||
      this.revivedAtStep !== null ||
      ((this.revivedAtStep = this.playStep),
      this.applyReviveTransform(),
      (this.birdRot = Sa),
      (this.birdGrounded = !1),
      (this.prevBirdY = this.birdY),
      (this.prevBirdRot = this.birdRot),
      (this.deathCause = null),
      this.emitSound("swoosh"),
      this.transition("play"));
  }
  applyReviveTransform() {
    (this.pipes = []), (this.birdY = 0), (this.birdVy = aa(this.simVersion));
  }
  flap() {
    if (this.currentState === "getready") {
      this.emitSound("flap"),
        this.beginRun(),
        this.transition("play"),
        (this.birdVy = aa(this.simVersion));
      return;
    }
    if (this.currentState === "play") {
      this.emitSound("flap"),
        (this.birdVy = aa(this.simVersion)),
        this.flaps[this.flaps.length - 1] !== this.playStep &&
          this.flaps.push(this.playStep);
      return;
    }
  }
  step(i) {
    (this.prevBirdY = this.birdY),
      (this.prevBirdRot = this.birdRot),
      (this.prevScrollX = this.scrollX),
      (this.prevPipeScroll = this.pipeScroll),
      (this.elapsed += i);
    const l = this.currentState === "play";
    if (this.currentState === "play" || this.currentState === "gameover") {
      const u = n0(this.simVersion);
      u !== null && this.birdVy < -u && (this.birdVy = -u),
        (this.birdVy -= $v),
        (this.birdY += Math.trunc(this.birdVy / 120)),
        tE(this.birdY) &&
          ((this.birdY = Gh + Ci),
          (this.birdVy = 0),
          (this.birdGrounded = !0),
          this.currentState === "play" &&
            ((this.deathCause = "ground"),
            this.emitSound("hit"),
            this.transition("gameover")));
    } else
      (this.birdY = Ne(Math.sin(this.elapsed * fE) * dE)),
        (this.birdVy = 0),
        (this.birdRot = 0);
    if (
      (this.currentState === "play" && this.checkPipeCollision(),
      this.currentState !== "gameover" &&
        ((this.scrollX += Si),
        this.currentState === "play" && this.advancePipes()),
      this.currentState === "play"
        ? (this.birdRot =
            this.birdVy > 0 ? Sa : Math.max(mE, Sa + Vt(this.birdVy) * pE))
        : this.currentState === "gameover"
          ? (this.birdRot = this.birdGrounded
              ? mE
              : Math.max(
                  mE,
                  Math.min(Sa + Vt(this.birdVy) * pE, this.prevBirdRot - crashSpin),
                ))
          : (this.birdRot = 0),
      this.currentState !== "gameover" && (this.animationTimer += i),
      l)
    ) {
      for (this.playStep += 1; this.pendingPasses > 0; )
        this.passSteps.push(this.playStep), (this.pendingPasses -= 1);
    }
  }
  get snapshot() {
    return this.composeSnapshot(this.birdY, this.birdRot, this.scrollX, 0, 1);
  }
  renderSnapshot(i) {
    return this.composeSnapshot(
      _a(this.prevBirdY, this.birdY, i),
      _a(this.prevBirdRot, this.birdRot, i),
      _a(this.prevScrollX, this.scrollX, i),
      (this.pipeScroll - this.prevPipeScroll) * (1 - i),
      i,
    );
  }
  composeSnapshot(i, l, u, c, f) {
    const h = this.pipes.map((g) => ({
      x: Vt(g.x) + Vt(c),
      gapY: Vt(g.gapY),
      halfGap: Vt(g.halfGap),
      passed: g.passed,
    }));
    return {
      state: this.currentState,
      birdY: Vt(i),
      birdRot: l,
      birdFrame: this.birdFrame(),
      pipes: h,
      scrollX: Vt(u),
      score: this.score,
      bestScore: this.bestScore,
      medal: this.medal(),
      elapsed: this.elapsed,
      stateElapsed: this.elapsed - this.stateEnteredElapsed,
      isNewBest: this.isNewBest,
    };
  }
  get state() {
    return this.currentState;
  }
  get stateElapsed() {
    return this.elapsed - this.stateEnteredElapsed;
  }
  get publishedState() {
    return {
      state: this.currentState,
      score: this.score,
      bestScore: this.bestScore,
    };
  }
  beginRun() {
    (this.runSeed = this.nextSeed ?? gE()),
      (this.prng = new ba(this.runSeed)),
      (this.playStep = 0),
      (this.spawnCount = 0),
      (this.flaps = [0]),
      (this.passSteps = []),
      (this.pendingPasses = 0),
      (this.deathCause = null),
      (this.birdY = 0),
      (this.birdGrounded = !1),
      (this.pipes = []),
      (this.revivedAtStep = null),
      (this.score = 0);
  }
  advancePipes() {
    const i = this.pipes[this.pipes.length - 1];
    (i ? _f - i.x >= r0 : this.playStep >= Vv) &&
      (this.pipes.push({
        x: _f,
        gapY: this.nextGapY(),
        halfGap: o0(this.simVersion, this.spawnCount),
        passed: !1,
      }),
      (this.spawnCount += 1)),
      (this.pipeScroll += Si);
    for (const u of this.pipes)
      (u.x -= Si),
        !u.passed &&
          u.x <= 0 &&
          ((u.passed = !0),
          (this.score += 1),
          (this.pendingPasses += 1),
          this.emitSound("score"));
    this.pipes.length > 0 && this.pipes[0].x < e0 && this.pipes.shift();
  }
  nextGapY() {
    return this.prng.nextGapY();
  }
  checkPipeCollision() {
    for (const i of this.pipes) {
      const l = nE(this.birdY, i);
      if (l !== null) {
        (this.deathCause = l === "top" ? "pipeTop" : "pipeBottom"),
          this.emitSound("hit"),
          this.emitSound("die"),
          this.transition("gameover");
        return;
      }
    }
  }
  medal() {
    return this.currentState !== "gameover"
      ? null
      : this.score >= 40
        ? "platinum"
        : this.score >= 30
          ? "gold"
          : this.score >= 20
            ? "silver"
            : this.score >= 10
              ? "bronze"
              : null;
  }
  birdFrame() {
    if (this.currentState === "gameover") return 2;
    const i = Math.floor(this.animationTimer / hE) % 4;
    return i === 0 ? 0 : i === 2 ? 2 : 1;
  }
  reset() {
    (this.birdY = 0),
      (this.birdVy = 0),
      (this.birdRot = 0),
      (this.birdGrounded = !1),
      (this.prevBirdY = 0),
      (this.prevBirdRot = 0),
      (this.prevPipeScroll = this.pipeScroll),
      (this.pipes = []),
      (this.score = 0),
      (this.isNewBest = !1);
  }
  transition(i) {
    if (i === "gameover" && this.score > this.bestScore) {
      (this.bestScore = this.score), (this.isNewBest = !0);
      for (const l of this.bestScoreListeners) l(this.bestScore);
    }
    (this.currentState = i), (this.stateEnteredElapsed = this.elapsed);
  }
  emitSound(i) {
    for (const l of this.soundListeners) l(i);
  }
}
const Op = [
    "Zippy",
    "Peppy",
    "Perky",
    "Jumpy",
    "Lofty",
    "Windy",
    "Sunny",
    "Misty",
    "Foggy",
    "Gusty",
    "Brisk",
    "Swift",
    "Quick",
    "Rapid",
    "Zoomy",
    "Turbo",
    "Hyper",
    "Mega",
    "Super",
    "Ultra",
    "Epic",
    "Retro",
    "Pixel",
    "Neon",
    "Gold",
    "Shiny",
    "Sleek",
    "Slick",
    "Sassy",
    "Zesty",
    "Spicy",
    "Gutsy",
    "Brave",
    "Bold",
    "Wild",
    "Fiery",
    "Solar",
    "Lunar",
    "Astro",
    "Nova",
    "Star",
    "Storm",
    "Downy",
    "Fuzzy",
    "Tiny",
    "Micro",
    "Mini",
    "Itty",
    "Jolly",
    "Merry",
    "Happy",
    "Lucky",
    "Dizzy",
    "Loopy",
    "Goofy",
    "Wacky",
    "Zany",
    "Nutty",
    "Agile",
    "Deft",
    "Spry",
    "Fleet",
    "High",
    "Soar",
    "Glide",
    "Flick",
    "Whirl",
    "Twirl",
    "Swoop",
    "Dive",
    "Loop",
    "Zig",
    "Zag",
    "Boop",
    "Bonk",
    "Early",
    "Night",
    "Dusk",
    "Royal",
    "Regal",
    "Noble",
    "Fancy",
    "Dandy",
    "Jazzy",
    "Funky",
    "Rocky",
    "Vivid",
    "Aero",
    "Sky",
    "Cloud",
    "Air",
    "Puffy",
    "Wavy",
    "Curly",
    "Amber",
    "Azure",
    "Coral",
    "Mango",
    "Berry",
    "Lemon",
    "Minty",
    "Candy",
    "Honey",
    "Pearl",
    "Ruby",
    "Opal",
    "Jade",
    "Onyx",
    "Topaz",
    "Cozy",
    "Zen",
    "Calm",
  ],
  Xs = [
    "Bird",
    "Birdie",
    "Finch",
    "Wren",
    "Robin",
    "Hawk",
    "Eagle",
    "Falcon",
    "Owl",
    "Owlet",
    "Chick",
    "Peep",
    "Pip",
    "Pippin",
    "Egg",
    "Beak",
    "Wing",
    "Plume",
    "Quill",
    "Talon",
    "Crest",
    "Perch",
    "Roost",
    "Flock",
    "Flyer",
    "Glider",
    "Dodo",
    "Kiwi",
    "Emu",
    "Toucan",
    "Parrot",
    "Macaw",
    "Budgie",
    "Canary",
    "Dove",
    "Pigeon",
    "Crow",
    "Raven",
    "Magpie",
    "Jay",
    "Cuckoo",
    "Lark",
    "Pipit",
    "Plover",
    "Puffin",
    "Petrel",
    "Tern",
    "Gull",
    "Heron",
    "Crane",
    "Stork",
    "Ibis",
    "Egret",
    "Osprey",
    "Merlin",
    "Condor",
    "Roc",
    "Piper",
    "Hopper",
    "Jumper",
    "Dasher",
    "Zoomer",
    "Racer",
    "Pilot",
    "Ace",
    "Rocket",
    "Jet",
    "Comet",
    "Breeze",
    "Gust",
    "Zephyr",
    "Wisp",
    "Chirp",
    "Tweet",
    "Cheep",
    "Squawk",
    "Trill",
    "Melody",
    "Nugget",
    "Waddle",
    "Wobble",
    "Bobble",
    "Noodle",
    "Doodle",
    "Peck",
    "Duck",
    "Goose",
    "Swan",
    "Hen",
    "Loon",
    "Grouse",
    "Quail",
    "Pipe",
    "Floof",
    "Birb",
    "Winger",
    "Flappy",
    "Diver",
    "Swoosh",
    "Bounce",
    "Hover",
    "Halo",
    "Vortex",
    "Streak",
    "Bolt",
    "Dart",
    "Arrow",
    "Zoomie",
    "Boost",
    "Nimbus",
    "Cirrus",
    "Spiral",
  ],
  Wa = 1e4,
  vE = 4,
  uu = 1179402576;
function Pp() {
  return Op.length * Xs.length * Wa;
}
function Ip(r) {
  return (
    (r = (r ^ (r >>> 16)) >>> 0),
    (r = Math.imul(r, 2246822507) >>> 0),
    (r = (r ^ (r >>> 13)) >>> 0),
    (r = Math.imul(r, 3266489909) >>> 0),
    (r = (r ^ (r >>> 16)) >>> 0),
    r
  );
}
function yE(r) {
  const i = [];
  for (let l = 0; l < vE; l++)
    i.push(Ip((r ^ Math.imul(2654435769, l + 1)) >>> 0));
  return i;
}
function SE(r) {
  let i = 1;
  for (; Math.pow(2, i) < r; ) i++;
  if ((i % 2 === 1 && i++, i > 52))
    throw new Error("domain too large for JS numbers");
  return i;
}
function _E(r, i, l) {
  let u = Math.floor(r / i),
    c = r % i;
  for (const f of l) {
    const h = (u + Ip((c ^ f) >>> 0)) % i;
    (u = c), (c = h);
  }
  return u * i + c;
}
function EE(r, i = uu) {
  const l = Pp();
  if (!Number.isInteger(r) || r < 0 || r >= l)
    throw new RangeError(`index must be an integer in [0, ${l})`);
  const u = SE(l),
    c = Math.pow(2, u / 2),
    f = yE(i >>> 0);
  let h = r;
  do h = _E(h, c, f);
  while (h >= l);
  return h;
}
function wE(r) {
  const i = r % Wa,
    l = Math.floor(r / Wa),
    u = l % Xs.length,
    c = Math.floor(l / Xs.length);
  return Op[c] + Xs[u] + String(i).padStart(4, "0");
}
function CE(r, i = uu) {
  return wE(EE(r, i));
}
function kE(r = Math.random, i = uu) {
  return CE(Math.floor(r() * Pp()), i);
}
const ah = Vt(Si),
  AE = -1.6,
  uh = 14;
function Ea(r, i, l) {
  return r + (i - r) * l;
}
class TE {
  constructor(i, l, u, c, f, h) {
    (this.name = i),
      (this.tint = l),
      (this.pilot = u),
      (this.hopStep = h),
      (this.game = new au(0)),
      this.game.seedPipes(c, f),
      (this.x = -h * ah),
      (this.prevX = this.x);
  }
  name;
  tint;
  pilot;
  hopStep;
  game;
  stepIndex = 0;
  x;
  prevX;
  prevY = 0;
  prevRot = 0;
  hopped = !1;
  dead = !1;
  finished = !1;
  get alive() {
    return !this.dead;
  }
  advance(i) {
    if (this.finished) return null;
    if (!this.hopped) {
      if (i < this.hopStep) return null;
      (this.hopped = !0), this.game.flap();
    }
    const l = this.game.snapshot;
    if (
      ((this.prevY = l.birdY),
      (this.prevRot = l.birdRot),
      (this.prevX = this.x),
      this.dead)
    )
      return (
        this.game.step(zn),
        (this.x -= ah),
        this.x < AE && (this.finished = !0),
        null
      );
    this.pilot.wantsFlap(l, this.stepIndex) && this.game.flap(),
      this.game.step(zn),
      (this.stepIndex += 1);
    const u = this.game.publishedState;
    return u.state === "gameover"
      ? ((this.dead = !0), { name: this.name, score: u.score })
      : null;
  }
  view(i, l, u) {
    if (!this.hopped || this.finished) return null;
    const c = this.game.snapshot;
    let f = Ea(this.prevY, c.birdY, l);
    const h = i - this.hopStep;
    if (h < uh) {
      const g = Math.max(h / uh, 0);
      f = u * (1 - g) + f * g;
    }
    return {
      x: Ea(this.prevX, this.x, l),
      y: f,
      rot: Ea(this.prevRot, c.birdRot, l),
      frame: c.birdFrame,
      alive: !this.dead,
      tint: this.tint,
    };
  }
}
const RE = 0.1,
  LE = 0.05,
  NE = 0.06,
  OE = -0.15,
  PE = 0.2,
  IE = 0.18,
  ME = 0.2,
  ch = 0.07,
  DE = 0.06,
  BE = 0.15,
  xE = 0.02,
  FE = 0.5,
  HE = 4,
  UE = 12,
  GE = 4,
  zE = 2,
  bE = 0.04,
  dh = 0.3,
  WE = 0.015,
  YE = 0.035,
  jE = -0.25,
  VE = 0.5,
  fh = 120;
function $E(r, i) {
  const l = () => r.nextFraction() / Sn,
    u = i === 0 ? l() * BE : l();
  return {
    blunderChance: xE + FE * u * u,
    latencyBase: HE + Math.round(u * UE),
    latencyJitter: GE,
    aimBias: (l() * 2 - 1) * bE * (dh + (1 - dh) * u),
    wobbleRange: WE + YE * u,
    hoverTarget: jE + l() * VE,
  };
}
class XE {
  constructor(i, l) {
    (this.rng = i), (this.profile = l);
  }
  rng;
  profile;
  pendingFlapStep = null;
  aimOrdinal = -1;
  pipeOffset = 0;
  prevY = 0;
  wantsFlap(i, l) {
    const u = this.resolveAim(i);
    u.aimedPipe &&
      u.ordinal !== this.aimOrdinal &&
      ((this.aimOrdinal = u.ordinal),
      (this.pipeOffset = this.rollPipeOffset(u.aimedPipe)));
    const c = u.target ?? this.profile.hoverTarget,
      f = (i.birdY - this.prevY) * fh,
      h = i.birdY <= this.prevY;
    if (((this.prevY = i.birdY), this.pendingFlapStep !== null))
      return l >= this.pendingFlapStep
        ? ((this.pendingFlapStep = null), !0)
        : !1;
    const _ =
      c - i.birdY > IE
        ? Math.max(zE, this.profile.latencyBase >> 1)
        : this.profile.latencyBase;
    return (
      h &&
        this.predictedY(i.birdY, f, _) < c &&
        (this.pendingFlapStep =
          l + _ + Math.floor(this.fraction() * this.profile.latencyJitter)),
      !1
    );
  }
  resolveAim(i) {
    const l = i.pipes;
    let u = 0;
    for (; u < l.length && l[u].x <= OE; ) u += 1;
    const c = u < l.length ? l[u] : null;
    if (!c) return { target: null, ordinal: -1, aimedPipe: null };
    const f = u + 1 < l.length ? l[u + 1] : null,
      h = i.score + (c.x > 0 ? 1 : 0),
      g = f !== null && c.x < PE,
      _ = g ? f : c,
      w = g ? h + 1 : h;
    let O = _.gapY + this.profile.aimBias + this.pipeOffset - RE;
    if (g) {
      const R = c.gapY + c.halfGap - ME - ch,
        L = c.gapY - c.halfGap + DE + ch;
      O = Math.min(Math.max(O, L), R);
    }
    return { target: O, ordinal: w, aimedPipe: _ };
  }
  predictedY(i, l, u) {
    const c = (u + this.profile.latencyJitter / 2) / fh;
    return i + l * c - (Se.gravity / 2) * c * c;
  }
  rollPipeOffset(i) {
    return this.fraction() < this.profile.blunderChance
      ? (this.fraction() < 0.5 ? 1 : -1) *
          (i.halfGap + LE + this.fraction() * NE)
      : (this.fraction() * 2 - 1) * this.profile.wobbleRange;
  }
  fraction() {
    return this.rng.nextFraction() / Sn;
  }
}
const wa = 29,
  hh = 10,
  KE = 150,
  QE = 4,
  ZE = 8,
  Mp = 2.8,
  qE = 3,
  JE = 120,
  ew = Vt(Si),
  tw = -1.6,
  nw = (1n << 64n) - 1n,
  rw = 0x94d049bb133111ebn,
  ph = [
    "#ffc9c9",
    "#c9e0ff",
    "#d6ffc9",
    "#ffedc2",
    "#e6ccff",
    "#c9fff1",
    "#ffd9f2",
    "#e0e0e0",
  ],
  Ya = 0.9;
function iw(r, i) {
  return new ba(r ^ ((BigInt(i + 1) * rw) & nw));
}
function sw(r, i) {
  const l = () => kE(() => r.nextFraction() / Sn);
  let u = l();
  for (let c = 0; c < ZE && i.has(u); c += 1) u = l();
  return i.add(u), u;
}
class lw {
  totalBirds = wa + 1;
  bots = [];
  feed = [];
  stepCount = 0;
  constructor(i, l, u) {
    const c = new Set(u ? [u] : []),
      f = (KE - hh) / (wa - 1);
    for (let h = 0; h < wa; h += 1) {
      const g = iw(i, h),
        _ = sw(g, c),
        w = $E(g, h),
        O = hh + Math.round(h * f) + Math.floor((g.nextFraction() / Sn) * QE);
      this.bots.push(new TE(_, ph[h % ph.length], new XE(g, w), i, l, O));
    }
  }
  get steps() {
    return this.stepCount;
  }
  advance() {
    this.stepCount += 1;
    for (const i of this.bots) {
      const l = i.advance(this.stepCount);
      l && this.feed.push({ ...l, step: this.stepCount });
    }
  }
  botNames() {
    return this.bots.map((i) => i.name);
  }
  aliveBotCount() {
    let i = 0;
    for (const l of this.bots) l.alive && (i += 1);
    return i;
  }
  views(i) {
    const l = Math.max(this.stepCount - 1 + i, 0),
      u = [];
    for (const c of this.bots) {
      const f = c.view(l, i, Ya);
      f && u.push(f);
    }
    return u;
  }
  busX(i) {
    const l = -Math.max(this.stepCount - 1 + i, 0) * ew;
    return l < tw ? null : l;
  }
  recentFeed() {
    const i = [];
    for (let l = this.feed.length - 1; l >= 0 && i.length < qE; l -= 1) {
      const u = this.feed[l],
        c = (this.stepCount - u.step) / JE;
      if (c > Mp) break;
      i.push({ name: u.name, score: u.score, ageSeconds: c });
    }
    return i;
  }
}
const ow = Mp;
function aw() {
  return typeof window > "u"
    ? !1
    : new URLSearchParams(window.location.search).has("royale");
}
const uw = 3,
  cw = 120;
class dw {
  constructor(i) {
    (this.game = i),
      (this.active = aw()),
      this.active && (window.__royale = this);
  }
  game;
  active;
  match = null;
  prevState = "getready";
  placement = null;
  winAtStep = null;
  aliveBots() {
    return this.match?.aliveBotCount() ?? 0;
  }
  matchSteps() {
    return this.match?.steps ?? 0;
  }
  afterStep() {
    if (!this.active) return;
    const i = this.game.publishedState.state;
    if (i === "play") {
      this.prevState !== "play" && this.beginMatch();
      const l = this.match;
      l &&
        (l.advance(),
        this.winAtStep === null &&
          l.aliveBotCount() === 0 &&
          (this.winAtStep = l.steps));
    } else
      i === "gameover" &&
        this.prevState === "play" &&
        this.match &&
        (this.placement =
          this.winAtStep !== null ? 1 : this.match.aliveBotCount() + 1);
    this.prevState = i;
  }
  frameView(i, l) {
    if (!this.active) return null;
    if (l.state === "getready" || !this.match)
      return {
        bots: [],
        bus: { x: 0, y: Ya },
        birdsLeft: this.match?.totalBirds ?? 30,
        totalBirds: this.match?.totalBirds ?? 30,
        feed: [],
        placement: null,
        winBanner: !1,
        inPlay: !1,
      };
    const u = this.match,
      c = l.state === "play",
      f = u.busX(i);
    return {
      bots: u.views(i),
      bus: f === null ? null : { x: f, y: Ya },
      birdsLeft: u.aliveBotCount() + (c ? 1 : 0),
      totalBirds: u.totalBirds,
      feed: u.recentFeed(),
      placement: l.state === "gameover" ? this.placement : null,
      winBanner:
        c && this.winAtStep !== null && (u.steps - this.winAtStep) / cw < uw,
      inPlay: c,
    };
  }
  beginMatch() {
    (this.match = new lw(
      this.game.currentSeed,
      this.game.runSimVersion,
      null,
    )),
      (this.placement = null),
      (this.winAtStep = null);
  }
}
const fw = 0.5,
  hw = 0.35,
  pw = 0.015,
  mw = 3,
  gw = "#33323a",
  vw = "#f5f5ef",
  yw = "#e0453a",
  Sw = "#a8e6f0";
function _w(r, i, l, u, c) {
  r.save(),
    r.translate(-Xh(u), 0),
    l.bus && Ew(r, l.bus.x, l.bus.y + Math.sin(c * mw) * pw);
  for (const f of l.bots)
    (r.globalAlpha = f.alive ? fw : hw),
      i.drawSprite(r, ru[f.frame], f.x, f.y, { rot: f.rot, tint: f.tint });
  r.restore();
}
function Ew(r, i, l) {
  r.save(),
    (r.fillStyle = gw),
    r.fillRect(i - 0.18, l - 0.1, 0.36, 0.2),
    (r.fillStyle = vw),
    r.fillRect(i - 0.17, l - 0.09, 0.34, 0.18),
    (r.fillStyle = yw),
    r.fillRect(i - 0.17, l - 0.035, 0.34, 0.035),
    (r.fillStyle = Sw);
  for (let u = 0; u < 3; u += 1)
    r.fillRect(i - 0.13 + u * 0.1, l + 0.015, 0.06, 0.05);
  r.restore();
}
function ww(r, i, l, u) {
  r.save();
  const c = -l / 2 + 0.06,
    f = u / 2 - 0.3;
  i.inPlay &&
    ($(r, `${i.birdsLeft}/${i.totalBirds} LEFT`, c, f, 0.07, "left"),
    i.feed.forEach((h, g) => {
      (r.globalAlpha = Math.max(0, 1 - h.ageSeconds / ow)),
        $(r, `${h.name} OUT (${h.score})`, c, f - 0.1 - g * 0.08, 0.05, "left");
    }),
    (r.globalAlpha = 1)),
    i.winBanner && $(r, "LAST BIRD FLYING!", 0, 0.6, 0.11, "center"),
    i.placement !== null &&
      $(
        r,
        `PLACED #${i.placement} OF ${i.totalBirds}`,
        0,
        u / 2 - 0.32,
        0.1,
        "center",
      ),
    r.restore();
}
const Dp = "flappy_bestScore";
function Cw() {
  try {
    const r = parseInt(__ls.getItem(Dp) ?? "0", 10);
    return Number.isFinite(r) && r > 0 ? r : 0;
  } catch {
    return 0;
  }
}
function kw(r) {
  try {
    __ls.setItem(Dp, r.toString());
  } catch {
    return;
  }
}
const Aw = 3 / 4,
  Tw = "#4EC0CA",
  Rw = "#111111";
class Lw {
  constructor(i, l) {
    (this.worldW = i), (this.worldH = l), (this.maxFrameW = l * Aw);
  }
  worldW;
  worldH;
  pixelsPerUnit = 1;
  offsetX = 0;
  offsetY = 0;
  frameW = 0;
  frameH = 0;
  framePxW = 0;
  framePxH = 0;
  canvasW = 0;
  canvasH = 0;
  safeBottomY = 0;
  dpr = 1;
  maxFrameW;
  handleResize(i, l, u, c) {
    (this.dpr = u),
      (this.canvasW = Math.round(i * u)),
      (this.canvasH = Math.round(l * u)),
      (this.pixelsPerUnit = Math.min(
        this.canvasW / this.worldW,
        this.canvasH / this.worldH,
      )),
      (this.frameW = Math.min(
        this.canvasW / this.pixelsPerUnit,
        this.maxFrameW,
      )),
      (this.frameH = this.canvasH / this.pixelsPerUnit),
      (this.framePxW = this.frameW * this.pixelsPerUnit),
      (this.framePxH = this.frameH * this.pixelsPerUnit),
      (this.offsetX = (this.canvasW - this.framePxW) / 2),
      (this.offsetY = (this.canvasH - this.framePxH) / 2),
      (this.safeBottomY = -this.frameH / 2 + (c * u) / this.pixelsPerUnit);
  }
  setupContext(i) {
    i.resetTransform();
    if (this.offsetX >= 1) {
      i.fillStyle = Rw;
      i.fillRect(0, 0, this.canvasW, this.canvasH);
    }

    i.save();
    i.translate(Math.round(this.offsetX), Math.round(this.offsetY));

    const frameWidth = Math.round(this.framePxW);
    const frameHeight = Math.round(this.framePxH);
    i.beginPath();
    if (this.offsetX >= 1) {
      const radius = Math.min(frameWidth, frameHeight) * 0.035;
      i.moveTo(radius, 0);
      i.lineTo(frameWidth - radius, 0);
      i.quadraticCurveTo(frameWidth, 0, frameWidth, radius);
      i.lineTo(frameWidth, frameHeight - radius);
      i.quadraticCurveTo(frameWidth, frameHeight, frameWidth - radius, frameHeight);
      i.lineTo(radius, frameHeight);
      i.quadraticCurveTo(0, frameHeight, 0, frameHeight - radius);
      i.lineTo(0, radius);
      i.quadraticCurveTo(0, 0, radius, 0);
      i.closePath();
    } else {
      i.rect(0, 0, frameWidth, frameHeight);
    }
    i.clip();

    i.fillStyle = Tw;
    i.fillRect(0, 0, this.framePxW, this.framePxH);
    i.translate(this.framePxW / 2, this.framePxH / 2);
    i.scale(this.pixelsPerUnit, -this.pixelsPerUnit);
  }
  restoreContext(i) {
    i.restore();
  }
  screenToWorld(i, l) {
    const u = i * this.dpr - this.offsetX - this.framePxW / 2,
      c = l * this.dpr - this.offsetY - this.framePxH / 2;
    return { x: u / this.pixelsPerUnit, y: -c / this.pixelsPerUnit };
  }
  cssPixelsToWorld(i) {
    return (i * this.dpr) / this.pixelsPerUnit;
  }
}
const nuN = [
    "number0",
    "number1",
    "number2",
    "number3",
    "number4",
    "number5",
    "number6",
    "number7",
    "number8",
    "number9",
  ],
  // source artwork sizes: every digit is 36 px tall, "1" is the only narrow one
  nuW = [24, 16, 24, 24, 24, 24, 24, 24, 24, 24],
  nuH = 36;
// draw an integer with the original Flappy Bird digit sprites (the ones the
// FlapPyBird project ships), centred ("center") or growing right from the given
// x ("left"); f is the digit height in world units.
function nu(r, i, l, u, c, f, h) {
  const g = String(l).split(""),
    _ = f / (nuH * Lf);
  let w = 0;
  for (const O of g) w += nuW[+O] * Lf * _;
  let O = h === "center" ? u - w / 2 : u;
  for (const R of g) {
    const L = nuW[+R] * Lf * _;
    i.drawSprite(r, nuN[+R], O + L / 2, c, { scale: _ }), (O += L);
  }
}
const mh = 0.45,
  gh = 0.035,
  Iw = 4,
  vh = 0.7;
class Mw {
  remaining = 0;
  trigger() {
    this.remaining = mh;
  }
  advance(i) {
    if (
      ((this.remaining = Math.max(0, this.remaining - i)), this.remaining === 0)
    )
      return { x: 0, y: 0 };
    const l = this.remaining / mh,
      u = (1 - l) * Iw * 2 * Math.PI;
    return { x: Math.sin(u) * gh * l, y: Math.cos(u * vh) * gh * vh * l };
  }
}
class Dw {
  constructor(i, l) {
    (this.step = i), (this.maxFrameSeconds = l);
  }
  step;
  maxFrameSeconds;
  accumulator = 0;
  advance(i) {
    if (i > this.maxFrameSeconds) return (this.accumulator = 0), 0;
    this.accumulator += i;
    let l = 0;
    for (; this.accumulator >= this.step; )
      (this.accumulator -= this.step), l++;
    return l;
  }
  reset() {
    this.accumulator = 0;
  }
  get alpha() {
    return this.accumulator / this.step;
  }
}
const Ca = ["<30", "30-45", "45-60", "60+"],
  Bw = 1e-6;
class xw {
  counts = [0, 0, 0, 0];
  reset() {
    this.counts = [0, 0, 0, 0];
  }
  record(i) {
    if (i < Bw) return;
    const l = 1 / i;
    l < 30
      ? (this.counts[0] += 1)
      : l < 45
        ? (this.counts[1] += 1)
        : l < 60
          ? (this.counts[2] += 1)
          : (this.counts[3] += 1);
  }
  medianBucket() {
    const i = this.counts.reduce((c, f) => c + f, 0);
    if (i === 0) return null;
    const l = (i - 1) / 2;
    let u = 0;
    for (let c = 0; c < this.counts.length; c++)
      if (((u += this.counts[c]), u > l)) return Ca[c];
    return Ca[Ca.length - 1];
  }
}
const yh = [1, 0.85, 0.7, 0.55],
  Fw = 1 / 165,
  Hw = 1.6,
  Uw = 2.5,
  Gw = 60,
  zw = 0.08;
class bw {
  stepIndex = 0;
  windowFastest = 1 / 0;
  windowSeconds = 0;
  windowFrames = 0;
  windowMisses = 0;
  lastWindowBad = !1;
  get scale() {
    return yh[this.stepIndex];
  }
  record(i) {
    if (
      i <= 0 ||
      (i < this.windowFastest && (this.windowFastest = Math.max(i, Fw)),
      (this.windowSeconds += i),
      (this.windowFrames += 1),
      i > this.windowFastest * Hw && (this.windowMisses += 1),
      this.windowSeconds < Uw || this.windowFrames < Gw)
    )
      return !1;
    const l = this.windowMisses / this.windowFrames;
    (this.windowFastest = 1 / 0),
      (this.windowSeconds = 0),
      (this.windowFrames = 0),
      (this.windowMisses = 0);
    const u = l > zw;
    return !u || !this.lastWindowBad || this.stepIndex >= yh.length - 1
      ? ((this.lastWindowBad = u), !1)
      : ((this.lastWindowBad = !1), (this.stepIndex += 1), !0);
  }
}
class Ww {
  constructor(i, l, u) {
    (this.game = i), (this.camera = l), (this.actions = u);
  }
  game;
  camera;
  actions;
  currentGameOverLayout() {
    return lu(this.camera.frameW, this.camera.safeBottomY);
  }
  handlePointerDown(i, l) {
    const u = this.camera.screenToWorld(i, l),
      c = this.game.state;
    if (c === "getready")
      Oy(u.x, u.y, this.camera.frameW, this.camera.frameH)
        ? this.actions.onToggleMute()
        : this.game.flap();
    else if (c === "play") this.game.flap();
  }
  handlePointerMove() {}
  handlePointerUp(i, l) {
    if (this.game.state !== "gameover") return;
    const u = this.camera.screenToWorld(i, l),
      c = _y(u.x, u.y, this.currentGameOverLayout());
    !c ||
      !this.gameOverButtonsActive() ||
      (c.kind === "play" ? this.actions.onPlay() : this.actions.onRevive());
  }
  handlePointerCancel() {}
  handleKeyDown(i) {
    const l = this.game.state;
    if (l === "getready" || l === "play")
      (i === "Space" || i === "ArrowUp") && this.game.flap();
    else if (l === "gameover")
      (i === "Space" || i === "Enter") &&
        this.gameOverButtonsActive() &&
        this.actions.onPlay();
  }
  gameOverButtonsActive() {
    return this.game.stateElapsed >= ap;
  }
}
const Yw = {
  request: (r) => requestAnimationFrame(r),
  cancel: (r) => cancelAnimationFrame(r),
};
class jw {
  constructor(i, l = Yw) {
    (this.onFrame = i), (this.scheduler = l);
  }
  onFrame;
  scheduler;
  frameId = 0;
  running = !1;
  start() {
    this.running || ((this.running = !0), this.scheduleNext());
  }
  stop() {
    (this.running = !1), this.scheduler.cancel(this.frameId);
  }
  restart() {
    this.stop(), this.start();
  }
  scheduleNext() {
    this.frameId = this.scheduler.request(this.tick);
  }
  tick = (i) => {
    this.running && (this.scheduleNext(), this.onFrame(i));
  };
}
const Bp = Me(!1, (r, i) => r === i);
const i1 = 0.25,
  Ch = {
    flap: "/audio/sfx_wing.mp3",
    score: "/audio/sfx_point.mp3",
    hit: "/audio/sfx_hit.mp3",
    die: "/audio/sfx_die.mp3",
    swoosh: "/audio/sfx_swooshing.mp3",
  },
  Aa = {};
let jt = null,
  fi = null;
const kh = {
    async init() {
      jt ||
        ((jt = new (window.AudioContext || window.webkitAudioContext)()),
        (fi = jt.createGain()),
        (fi.gain.value = i1),
        fi.connect(jt.destination));
      const r = Object.keys(Ch).map(async (i) => {
        try {
          const u = await (await fetch(Ch[i])).arrayBuffer(),
            c = await jt.decodeAudioData(u);
          Aa[i] = c;
        } catch (l) {
          console.error(`Failed to load audio: ${i}`, l);
        }
      });
      await Promise.all(r);
    },
    play(r) {
      if (ki.getSnapshot() || !jt || !fi || !Aa[r]) return;
      jt.state === "suspended" && jt.resume();
      const i = jt.createBufferSource();
      (i.buffer = Aa[r]), i.connect(fi), i.start(0);
    },
  };
const _C = new Set(["ArrowDown", "PageUp", "PageDown", "Home", "End"]),
  EC = 1.44,
  wC = 2.56,
  CC = 0.25;
class AC {
  constructor(i) {
    this.canvas = i;
    const l = i.getContext("2d", { alpha: !1 });
    if (!l) throw new Error("Failed to acquire 2D rendering context");
    (this.ctx = l),
      (this.game = new au(Cw())),
      (this.royale = new dw(this.game)),
      (this.inputRouter = new Ww(this.game, this.camera, {
        onPlay: () => this.playOn(),
        onRevive: () => this.revive(),
        onToggleMute: () => ki.toggleMuted(),
      })),
      (this.frameLoop = new jw((u) => this.frame(u)));
  }
  canvas;
  ctx;
  renderer = new L0();
  camera = new Lw(EC, wC);
  game;
  royale;
  gameOverCarousel = new vy();
  inputRouter;
  lastState = "getready";
  screenShake = new Mw();
  timestep = new Dw(zn, CC);
  fpsMeter = new xw();
  renderScale = new bw();
  frameLoop;
  lastTime = 0;
  paused = !1;
  unsubscribeSound = () => {};
  unsubscribeBestScore = () => {};
  playOn() {
    this.game.restart();
  }
  reviveAvailable() {
    return this.game.state === "gameover" && !this.game.wasRevived;
  }
  revive() {
    this.reviveAvailable() && this.game.revive();
  }
  start() {
    this.renderer.loadAll().then(() => Bp.publish(!0)),
      sl(() => {
        kh.init();
      }),
      (this.unsubscribeSound = this.game.onSound((l) => kh.play(l))),
      (this.unsubscribeBestScore = this.game.onBestScoreChanged(kw)),
      (window.__game = this.game),
      window.addEventListener("resize", this.handleResize),
      window.addEventListener("keydown", this.handleKeyDown),
      document.addEventListener(
        "visibilitychange",
        this.handleVisibilityChange,
      ),
      this.canvas.addEventListener("pointerdown", this.handlePointerDown),
      this.canvas.addEventListener("pointermove", this.handlePointerMove),
      this.canvas.addEventListener("pointerup", this.handlePointerUp),
      this.canvas.addEventListener("pointercancel", this.handlePointerCancel),
      this.handleResize(),
      (this.lastTime = performance.now()),
      this.frameLoop.start();
  }
  dispose() {
    window.removeEventListener("resize", this.handleResize),
      window.removeEventListener("keydown", this.handleKeyDown),
      document.removeEventListener(
        "visibilitychange",
        this.handleVisibilityChange,
      ),
      this.canvas.removeEventListener("pointerdown", this.handlePointerDown),
      this.canvas.removeEventListener("pointermove", this.handlePointerMove),
      this.canvas.removeEventListener("pointerup", this.handlePointerUp),
      this.canvas.removeEventListener(
        "pointercancel",
        this.handlePointerCancel,
      ),
      this.frameLoop.stop(),
      this.unsubscribeSound(),
      this.unsubscribeBestScore();
  }
  handleResize = () => {
    const i = (window.devicePixelRatio || 1) * this.renderScale.scale;
    this.camera.handleResize(window.innerWidth, window.innerHeight, i, 0),
      this.canvas.width !== this.camera.canvasW &&
        (this.canvas.width = this.camera.canvasW),
      this.canvas.height !== this.camera.canvasH &&
        (this.canvas.height = this.camera.canvasH);
    const l = `${window.innerWidth}px`,
      u = `${window.innerHeight}px`;
    this.canvas.style.width !== l && (this.canvas.style.width = l),
      this.canvas.style.height !== u && (this.canvas.style.height = u);
  };
  handleKeyDown = (i) => {
    if (i.code === "KeyP") {
      i.preventDefault(), (this.paused = !this.paused);
      return;
    }
    (i.code === "Space" || i.code === "ArrowUp") && i.preventDefault(),
      this.game.state === "play" && _C.has(i.code) && i.preventDefault(),
      this.inputRouter.handleKeyDown(i.code);
  };
  handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      this.inputRouter.handlePointerCancel();
      return;
    }
    (this.lastTime = performance.now()),
      this.timestep.reset(),
      this.frameLoop.restart();
  };
  handlePointerDown = (i) => {
    this.inputRouter.handlePointerDown(i.clientX, i.clientY),
      this.tryCapturePointer(i.pointerId);
  };
  tryCapturePointer(i) {
    try {
      this.canvas.setPointerCapture(i);
    } catch {
      return;
    }
  }
  handlePointerMove = (i) => {
    this.inputRouter.handlePointerMove(i.clientX, i.clientY);
  };
  handlePointerUp = (i) => {
    this.inputRouter.handlePointerUp(i.clientX, i.clientY);
  };
  handlePointerCancel = () => {
    this.inputRouter.handlePointerCancel();
  };
  frame = (i) => {
    const l = (i - this.lastTime) / 1e3;
    if (((this.lastTime = i), this.paused)) this.timestep.reset();
    else {
      const c = this.timestep.advance(l);
      for (let f = 0; f < c; f++) this.game.step(zn), this.royale.afterStep();
    }
    const u = this.game.renderSnapshot(this.timestep.alpha);
    if (
      (u.state === "play" &&
        (this.lastState !== "play" && this.fpsMeter.reset(),
        this.paused ||
          (this.fpsMeter.record(l),
          this.renderScale.record(l) && this.handleResize())),
      u.state === "gameover" &&
        this.lastState !== "gameover" &&
        (this.handleResize(),
        this.gameOverCarousel.reset(),
        this.screenShake.trigger()),
      (this.lastState = u.state),
      Mt.publish(this.game.publishedState),
      this.renderer.isLoaded())
    ) {
      this.camera.setupContext(this.ctx);
      const c = this.screenShake.advance(l);
      this.ctx.translate(c.x, c.y),
        H0(this.ctx, this.renderer, u, this.camera.frameW, this.camera.frameH);
      const f = this.royale.frameView(this.timestep.alpha, u);
      f && _w(this.ctx, this.renderer, f, this.camera.frameW, u.elapsed),
        j_(
          this.ctx,
          this.renderer,
          u,
          this.camera.frameW,
          this.camera.frameH,
          this.camera.safeBottomY,
          ki.getSnapshot(),
          this.reviveAvailable(),
        ),
        f && ww(this.ctx, f, this.camera.frameW, this.camera.frameH),
        this.camera.restoreContext(this.ctx);
    }
  };
}
function TC() {
  const r = fe.useRef(null);
  return (
    fe.useEffect(() => {
      const i = r.current;
      if (!i) return;
      const l = new AC(i);
      return l.start(), () => l.dispose();
    }, []),
    P.jsx("canvas", {
      ref: r,
      style: { display: "block", touchAction: "none" },
    })
  );
}
function RC() {
  const r = qe(Bp);
  return P.jsxs("div", {
    className: "loading-overlay",
    "data-loaded": r,
    children: [
      P.jsx("img", {
        className: "loading-overlay__logo",
        src: "/sprites/logo.png",
        alt: "Flappy Bird",
      }),
      P.jsx("div", { className: "loading-overlay__spinner" }),
      P.jsx("div", {
        className: "loading-overlay__label",
        children: "Loading…",
      }),
    ],
  });
}
function Ph() {
  return P.jsxs(P.Fragment, {
    children: [P.jsx(TC, {}), P.jsx(RC, {})],
  });
}
function ek() {
  return P.jsx(Ph, {});
}
const Em = document.getElementById("root");
if (!Em) throw new Error("Root element #root not found");
Nv.createRoot(Em).render(P.jsx(fe.StrictMode, { children: P.jsx(ek, {}) }));
