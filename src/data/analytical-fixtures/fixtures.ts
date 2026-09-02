// GENERATED FILE — do not edit by hand.
// Source: packages/ds-contracts/analytical-fixtures/fixtures.jsonl
// Source sha256: 58d98701659173f1c2c02ab29b2c30095aca6e7fddd16108a593dda8fee4940d
// Regenerate:    node scripts/sync-analytical-fixtures.mjs
// Answer-free by construction: this dump carries fixtures only — no corpus
// case ids, verdicts, diagnostics, obligations, bindings, or holdouts. The
// sync script refuses to write any key that looks like answer-key material.
import type { AnalyticalFixture } from "./types";

export const FIXTURES: AnalyticalFixture[] = [
  {
    "id": "FX_SURVEY_MEAN_SATISFACTION",
    "structure": {
      "relations": {
        "survey": {
          "grain": [
            "respondent"
          ],
          "fields": {
            "respondent": {
              "scale": "nominal",
              "key": true
            },
            "satisfaction": {
              "scale": "ordinal",
              "order": {
                "kind": "total",
                "values": [
                  1,
                  2,
                  3,
                  4,
                  5
                ]
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "survey",
        "field": "satisfaction",
        "op": "mean"
      }
    ]
  },
  {
    "id": "FX_LIKERT_MEAN_CODE",
    "structure": {
      "relations": {
        "responses": {
          "grain": [
            "response_id"
          ],
          "fields": {
            "response_id": {
              "scale": "nominal",
              "key": true
            },
            "code": {
              "scale": "ordinal",
              "order": {
                "kind": "total",
                "values": [
                  1,
                  2,
                  3,
                  4,
                  5
                ]
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "responses",
        "field": "code",
        "op": "mean"
      }
    ]
  },
  {
    "id": "FX_TEMP_RATIO_COMPARISON",
    "structure": {
      "relations": {
        "readings": {
          "grain": [
            "city"
          ],
          "fields": {
            "city": {
              "scale": "nominal",
              "key": true
            },
            "temp": {
              "scale": "interval",
              "unit": {
                "dimension": "temperature",
                "unit": "celsius"
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "ratio-comparison",
        "relation": "readings",
        "field": "temp"
      }
    ]
  },
  {
    "id": "FX_TEMP_SUM",
    "structure": {
      "relations": {
        "readings": {
          "grain": [
            "city"
          ],
          "fields": {
            "city": {
              "scale": "nominal",
              "key": true
            },
            "temp": {
              "scale": "interval",
              "unit": {
                "dimension": "temperature",
                "unit": "celsius"
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "readings",
        "field": "temp",
        "op": "sum"
      }
    ]
  },
  {
    "id": "FX_REGION_MAX",
    "structure": {
      "relations": {
        "sites": {
          "grain": [
            "site_id"
          ],
          "fields": {
            "site_id": {
              "scale": "nominal",
              "key": true
            },
            "region": {
              "scale": "nominal"
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "sites",
        "field": "region",
        "op": "max"
      }
    ]
  },
  {
    "id": "FX_LOGIN_HOUR_MEAN",
    "structure": {
      "relations": {
        "logins": {
          "grain": [
            "login_id"
          ],
          "fields": {
            "login_id": {
              "scale": "nominal",
              "key": true
            },
            "hour": {
              "scale": "cyclic",
              "period": 24
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "logins",
        "field": "hour",
        "op": "mean"
      }
    ]
  },
  {
    "id": "FX_USER_ID_SUM",
    "structure": {
      "relations": {
        "users": {
          "grain": [
            "user_id"
          ],
          "fields": {
            "user_id": {
              "scale": "nominal",
              "key": true
            },
            "plan": {
              "scale": "nominal"
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "users",
        "field": "user_id",
        "op": "sum"
      }
    ]
  },
  {
    "id": "FX_EVENT_AT_SUM",
    "structure": {
      "relations": {
        "events": {
          "grain": [
            "event_id"
          ],
          "fields": {
            "event_id": {
              "scale": "nominal",
              "key": true
            },
            "at": {
              "scale": "interval",
              "temporality": {
                "kind": "instant",
                "grain": "second"
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "events",
        "field": "at",
        "op": "sum"
      }
    ]
  },
  {
    "id": "FX_STOCK_SUM_ALONG_DATE",
    "structure": {
      "relations": {
        "stock": {
          "grain": [
            "product",
            "date"
          ],
          "fields": {
            "product": {
              "scale": "nominal"
            },
            "date": {
              "scale": "interval",
              "temporality": {
                "kind": "instant",
                "grain": "day"
              }
            },
            "on_hand": {
              "scale": "count",
              "additivity": {
                "kind": "semi-additive",
                "nonAdditiveAlong": [
                  "date"
                ]
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "stock",
        "field": "on_hand",
        "op": "sum",
        "along": [
          "date"
        ]
      }
    ]
  },
  {
    "id": "FX_GDP_PER_CAPITA_ROLLUP_MEAN",
    "structure": {
      "relations": {
        "regions": {
          "grain": [
            "region",
            "year"
          ],
          "fields": {
            "region": {
              "scale": "nominal"
            },
            "year": {
              "scale": "interval",
              "temporality": {
                "kind": "instant",
                "grain": "year"
              }
            },
            "gdp": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "unit": "USD"
              }
            },
            "population": {
              "scale": "count"
            },
            "gdp_per_capita": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "unit": "USD",
                "rate": {
                  "numerator": "currency",
                  "denominator": "dimensionless"
                }
              },
              "additivity": {
                "kind": "ratio-measure",
                "numerator": "gdp",
                "denominator": "population"
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "rollup",
        "relation": "regions",
        "field": "gdp_per_capita",
        "toGrain": [
          "year"
        ],
        "op": "mean"
      }
    ]
  },
  {
    "id": "FX_SHARE_SUM_ACROSS_MARKETS",
    "structure": {
      "relations": {
        "shares": {
          "grain": [
            "company",
            "market"
          ],
          "fields": {
            "company": {
              "scale": "nominal"
            },
            "market": {
              "scale": "nominal"
            },
            "share": {
              "scale": "proportion",
              "whole": {
                "perRow": "market"
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "shares",
        "field": "share",
        "op": "sum"
      }
    ]
  },
  {
    "id": "FX_SALES_SUM_MIXED_UNITS_DECLARED",
    "structure": {
      "relations": {
        "sales": {
          "grain": [
            "sale_id"
          ],
          "fields": {
            "sale_id": {
              "scale": "nominal",
              "key": true
            },
            "amount": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "units": [
                  "USD",
                  "EUR"
                ]
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "sales",
        "field": "amount",
        "op": "sum"
      }
    ]
  },
  {
    "id": "FX_PCT_MEAN_NO_WHOLE",
    "structure": {
      "relations": {
        "metrics": {
          "grain": [
            "metric_id"
          ],
          "fields": {
            "metric_id": {
              "scale": "nominal",
              "key": true
            },
            "pct": {
              "scale": "proportion"
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "metrics",
        "field": "pct",
        "op": "mean"
      }
    ]
  },
  {
    "id": "FX_INDEX_MEAN_NO_BASE",
    "structure": {
      "relations": {
        "prices": {
          "grain": [
            "price_id"
          ],
          "fields": {
            "price_id": {
              "scale": "nominal",
              "key": true
            },
            "idx": {
              "scale": "index"
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "prices",
        "field": "idx",
        "op": "mean"
      }
    ]
  },
  {
    "id": "FX_MASS_SUM_UNHANDLED_ERROR",
    "structure": {
      "relations": {
        "readings": {
          "grain": [
            "reading_id"
          ],
          "fields": {
            "reading_id": {
              "scale": "nominal",
              "key": true
            },
            "mass": {
              "scale": "ratio",
              "unit": {
                "dimension": "mass",
                "unit": "kg"
              },
              "permits": {
                "uncertainty": [
                  "measurement-error"
                ]
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "readings",
        "field": "mass",
        "op": "sum"
      }
    ]
  },
  {
    "id": "FX_SURVIVAL_MEAN_WITH_CENSORED_ROWS",
    "structure": {
      "relations": {
        "survival": {
          "grain": [
            "subject_id"
          ],
          "fields": {
            "subject_id": {
              "scale": "nominal",
              "key": true
            },
            "days": {
              "scale": "ratio",
              "temporality": {
                "kind": "duration",
                "grain": "day"
              },
              "permits": {
                "null": [
                  "censored"
                ]
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "survival",
        "field": "days",
        "op": "mean"
      }
    ],
    "evidence": {
      "rows": {
        "survival": [
          {
            "subject_id": "s1",
            "days": 30
          },
          {
            "subject_id": "s2",
            "days": {
              "null": "censored"
            }
          },
          {
            "subject_id": "s3",
            "days": 12
          }
        ]
      }
    }
  },
  {
    "id": "FX_ORDERS_ROLLUP_UNKNOWN_GRAIN",
    "structure": {
      "relations": {
        "orders": {
          "grain": "unknown",
          "fields": {
            "order_id": {
              "scale": "nominal"
            },
            "amount": {
              "scale": "ratio"
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "rollup",
        "relation": "orders",
        "field": "amount",
        "toGrain": [],
        "op": "sum"
      }
    ]
  },
  {
    "id": "FX_SALES_SUM_PERROW_UNIT_NO_ROWS",
    "structure": {
      "relations": {
        "sales": {
          "grain": [
            "sale_id"
          ],
          "fields": {
            "sale_id": {
              "scale": "nominal",
              "key": true
            },
            "amount": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "perRow": true
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "sales",
        "field": "amount",
        "op": "sum"
      }
    ]
  },
  {
    "id": "FX_CELLS_SUM_PERMITS_SUPPRESSED_NO_ROWS",
    "structure": {
      "relations": {
        "cells": {
          "grain": [
            "cell_id"
          ],
          "fields": {
            "cell_id": {
              "scale": "nominal",
              "key": true
            },
            "n": {
              "scale": "count",
              "permits": {
                "null": [
                  "suppressed"
                ]
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "cells",
        "field": "n",
        "op": "sum"
      }
    ]
  },
  {
    "id": "FX_N_SURVEY_MEAN_RATIO_SCORE",
    "structure": {
      "relations": {
        "survey": {
          "grain": [
            "respondent"
          ],
          "fields": {
            "respondent": {
              "scale": "nominal",
              "key": true
            },
            "score": {
              "scale": "ratio"
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "survey",
        "field": "score",
        "op": "mean"
      }
    ]
  },
  {
    "id": "FX_N_TEMP_KELVIN_RATIO_COMPARISON",
    "structure": {
      "relations": {
        "readings": {
          "grain": [
            "city"
          ],
          "fields": {
            "city": {
              "scale": "nominal",
              "key": true
            },
            "temp_k": {
              "scale": "ratio",
              "unit": {
                "dimension": "temperature",
                "unit": "kelvin"
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "ratio-comparison",
        "relation": "readings",
        "field": "temp_k"
      }
    ]
  },
  {
    "id": "FX_N_TEMP_MEAN",
    "structure": {
      "relations": {
        "readings": {
          "grain": [
            "city"
          ],
          "fields": {
            "city": {
              "scale": "nominal",
              "key": true
            },
            "temp": {
              "scale": "interval",
              "unit": {
                "dimension": "temperature",
                "unit": "celsius"
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "readings",
        "field": "temp",
        "op": "mean"
      }
    ]
  },
  {
    "id": "FX_N_ORDINAL_MAX",
    "structure": {
      "relations": {
        "garments": {
          "grain": [
            "garment_id"
          ],
          "fields": {
            "garment_id": {
              "scale": "nominal",
              "key": true
            },
            "size": {
              "scale": "ordinal",
              "order": {
                "kind": "total",
                "values": [
                  "S",
                  "M",
                  "L"
                ]
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "garments",
        "field": "size",
        "op": "max"
      }
    ]
  },
  {
    "id": "FX_N_LOGIN_HOUR_COUNT",
    "structure": {
      "relations": {
        "logins": {
          "grain": [
            "login_id"
          ],
          "fields": {
            "login_id": {
              "scale": "nominal",
              "key": true
            },
            "hour": {
              "scale": "cyclic",
              "period": 24
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "logins",
        "field": "hour",
        "op": "count"
      }
    ]
  },
  {
    "id": "FX_N_USER_ID_COUNT",
    "structure": {
      "relations": {
        "users": {
          "grain": [
            "user_id"
          ],
          "fields": {
            "user_id": {
              "scale": "nominal",
              "key": true
            },
            "plan": {
              "scale": "nominal"
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "users",
        "field": "user_id",
        "op": "count"
      }
    ]
  },
  {
    "id": "FX_N_DURATION_SUM",
    "structure": {
      "relations": {
        "sessions": {
          "grain": [
            "session_id"
          ],
          "fields": {
            "session_id": {
              "scale": "nominal",
              "key": true
            },
            "length": {
              "scale": "ratio",
              "temporality": {
                "kind": "duration",
                "grain": "second"
              },
              "unit": {
                "dimension": "time",
                "unit": "s"
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "sessions",
        "field": "length",
        "op": "sum"
      }
    ]
  },
  {
    "id": "FX_N_STOCK_SUM_ALONG_PRODUCT",
    "structure": {
      "relations": {
        "stock": {
          "grain": [
            "product",
            "date"
          ],
          "fields": {
            "product": {
              "scale": "nominal"
            },
            "date": {
              "scale": "interval",
              "temporality": {
                "kind": "instant",
                "grain": "day"
              }
            },
            "on_hand": {
              "scale": "count",
              "additivity": {
                "kind": "semi-additive",
                "nonAdditiveAlong": [
                  "date"
                ]
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "stock",
        "field": "on_hand",
        "op": "sum",
        "along": [
          "product"
        ]
      }
    ]
  },
  {
    "id": "FX_N_GDP_PER_CAPITA_REDERIVE",
    "structure": {
      "relations": {
        "regions": {
          "grain": [
            "region",
            "year"
          ],
          "fields": {
            "region": {
              "scale": "nominal"
            },
            "year": {
              "scale": "interval",
              "temporality": {
                "kind": "instant",
                "grain": "year"
              }
            },
            "gdp": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "unit": "USD"
              }
            },
            "population": {
              "scale": "count"
            },
            "gdp_per_capita": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "unit": "USD",
                "rate": {
                  "numerator": "currency",
                  "denominator": "dimensionless"
                }
              },
              "additivity": {
                "kind": "ratio-measure",
                "numerator": "gdp",
                "denominator": "population"
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "rollup",
        "relation": "regions",
        "field": "gdp_per_capita",
        "toGrain": [
          "year"
        ],
        "op": "rederive"
      }
    ]
  },
  {
    "id": "FX_N_SHARE_SUM_WITHIN_MARKET",
    "structure": {
      "relations": {
        "shares": {
          "grain": [
            "company",
            "market"
          ],
          "fields": {
            "company": {
              "scale": "nominal"
            },
            "market": {
              "scale": "nominal"
            },
            "share": {
              "scale": "proportion",
              "whole": {
                "perRow": "market"
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "shares",
        "field": "share",
        "op": "sum",
        "along": [
          "company"
        ]
      }
    ]
  },
  {
    "id": "FX_N_SALES_SUM_WITH_CONVERSIONS",
    "structure": {
      "relations": {
        "sales": {
          "grain": [
            "sale_id"
          ],
          "fields": {
            "sale_id": {
              "scale": "nominal",
              "key": true
            },
            "amount": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "units": [
                  "USD",
                  "EUR"
                ],
                "conversions": {
                  "EUR": 1.08
                }
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "sales",
        "field": "amount",
        "op": "sum"
      }
    ]
  },
  {
    "id": "FX_N_PCT_MEAN_WITH_WHOLE",
    "structure": {
      "relations": {
        "metrics": {
          "grain": [
            "metric_id"
          ],
          "fields": {
            "metric_id": {
              "scale": "nominal",
              "key": true
            },
            "pct": {
              "scale": "proportion",
              "whole": "respondents"
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "metrics",
        "field": "pct",
        "op": "mean"
      }
    ]
  },
  {
    "id": "FX_N_INDEX_MEAN_WITH_BASE",
    "structure": {
      "relations": {
        "prices": {
          "grain": [
            "price_id"
          ],
          "fields": {
            "price_id": {
              "scale": "nominal",
              "key": true
            },
            "idx": {
              "scale": "index",
              "base": "2020=100"
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "prices",
        "field": "idx",
        "op": "mean"
      }
    ]
  },
  {
    "id": "FX_N_MASS_SUM_PROPAGATE",
    "structure": {
      "relations": {
        "readings": {
          "grain": [
            "reading_id"
          ],
          "fields": {
            "reading_id": {
              "scale": "nominal",
              "key": true
            },
            "mass": {
              "scale": "ratio",
              "unit": {
                "dimension": "mass",
                "unit": "kg"
              },
              "permits": {
                "uncertainty": [
                  "measurement-error"
                ]
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "readings",
        "field": "mass",
        "op": "sum",
        "uncertainty": "propagate"
      }
    ]
  },
  {
    "id": "FX_N_SURVIVAL_MEAN_EXCLUDE_CENSORED",
    "structure": {
      "relations": {
        "survival": {
          "grain": [
            "subject_id"
          ],
          "fields": {
            "subject_id": {
              "scale": "nominal",
              "key": true
            },
            "days": {
              "scale": "ratio",
              "temporality": {
                "kind": "duration",
                "grain": "day"
              },
              "permits": {
                "null": [
                  "censored"
                ]
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "survival",
        "field": "days",
        "op": "mean",
        "nulls": "exclude"
      }
    ],
    "evidence": {
      "rows": {
        "survival": [
          {
            "subject_id": "s1",
            "days": 30
          },
          {
            "subject_id": "s2",
            "days": {
              "null": "censored"
            }
          },
          {
            "subject_id": "s3",
            "days": 12
          }
        ]
      }
    }
  },
  {
    "id": "FX_T_GRAIN_WITNESS_UNIQUE_ROWS",
    "structure": {
      "relations": {
        "orders": {
          "grain": "unknown",
          "fields": {
            "order_id": {
              "scale": "nominal"
            },
            "amount": {
              "scale": "ratio"
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "rollup",
        "relation": "orders",
        "field": "amount",
        "toGrain": [],
        "op": "sum"
      }
    ],
    "evidence": {
      "grainWitness": {
        "orders": [
          "order_id"
        ]
      },
      "rows": {
        "orders": [
          {
            "order_id": "o1",
            "amount": 10
          },
          {
            "order_id": "o2",
            "amount": 25
          },
          {
            "order_id": "o3",
            "amount": 7
          }
        ]
      }
    }
  },
  {
    "id": "FX_T_GRAIN_WITNESS_DUPLICATE_ROWS",
    "structure": {
      "relations": {
        "orders": {
          "grain": "unknown",
          "fields": {
            "order_id": {
              "scale": "nominal"
            },
            "amount": {
              "scale": "ratio"
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "rollup",
        "relation": "orders",
        "field": "amount",
        "toGrain": [],
        "op": "sum"
      }
    ],
    "evidence": {
      "grainWitness": {
        "orders": [
          "order_id"
        ]
      },
      "rows": {
        "orders": [
          {
            "order_id": "o1",
            "amount": 10
          },
          {
            "order_id": "o1",
            "amount": 10
          },
          {
            "order_id": "o2",
            "amount": 25
          }
        ]
      }
    }
  },
  {
    "id": "FX_T_CURRENCY_ROWS_ONE_UNIT",
    "structure": {
      "relations": {
        "sales": {
          "grain": [
            "sale_id"
          ],
          "fields": {
            "sale_id": {
              "scale": "nominal",
              "key": true
            },
            "amount": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "perRow": true
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "sales",
        "field": "amount",
        "op": "sum"
      }
    ],
    "evidence": {
      "rows": {
        "sales": [
          {
            "sale_id": "a",
            "amount": {
              "value": 100,
              "unit": "USD"
            }
          },
          {
            "sale_id": "b",
            "amount": {
              "value": 40,
              "unit": "USD"
            }
          }
        ]
      }
    }
  },
  {
    "id": "FX_T_CURRENCY_ROWS_MIXED",
    "structure": {
      "relations": {
        "sales": {
          "grain": [
            "sale_id"
          ],
          "fields": {
            "sale_id": {
              "scale": "nominal",
              "key": true
            },
            "amount": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "perRow": true
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "sales",
        "field": "amount",
        "op": "sum"
      }
    ],
    "evidence": {
      "rows": {
        "sales": [
          {
            "sale_id": "a",
            "amount": {
              "value": 100,
              "unit": "USD"
            }
          },
          {
            "sale_id": "b",
            "amount": {
              "value": 40,
              "unit": "EUR"
            }
          }
        ]
      }
    }
  },
  {
    "id": "FX_T_SUPPRESSED_ROWS_CLEAN",
    "structure": {
      "relations": {
        "cells": {
          "grain": [
            "cell_id"
          ],
          "fields": {
            "cell_id": {
              "scale": "nominal",
              "key": true
            },
            "n": {
              "scale": "count",
              "permits": {
                "null": [
                  "suppressed"
                ]
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "cells",
        "field": "n",
        "op": "sum"
      }
    ],
    "evidence": {
      "rows": {
        "cells": [
          {
            "cell_id": "c1",
            "n": 12
          },
          {
            "cell_id": "c2",
            "n": 31
          }
        ]
      }
    }
  },
  {
    "id": "FX_T_SUPPRESSED_ROWS_AS_ZERO",
    "structure": {
      "relations": {
        "cells": {
          "grain": [
            "cell_id"
          ],
          "fields": {
            "cell_id": {
              "scale": "nominal",
              "key": true
            },
            "n": {
              "scale": "count",
              "permits": {
                "null": [
                  "suppressed"
                ]
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "cells",
        "field": "n",
        "op": "sum",
        "nulls": "as-zero"
      }
    ],
    "evidence": {
      "rows": {
        "cells": [
          {
            "cell_id": "c1",
            "n": 12
          },
          {
            "cell_id": "c2",
            "n": {
              "null": "suppressed"
            }
          }
        ]
      }
    }
  },
  {
    "id": "FX_S_TWO_CURRENCY_SUMS_TWO_UNKNOWN_GRAINS",
    "structure": {
      "relations": {
        "a": {
          "grain": [
            "id"
          ],
          "fields": {
            "id": {
              "scale": "nominal",
              "key": true
            },
            "amount": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "units": [
                  "USD",
                  "EUR"
                ]
              }
            }
          }
        },
        "b": {
          "grain": [
            "id"
          ],
          "fields": {
            "id": {
              "scale": "nominal",
              "key": true
            },
            "amount": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "units": [
                  "GBP",
                  "JPY"
                ]
              }
            }
          }
        },
        "c": {
          "grain": "unknown",
          "fields": {
            "total": {
              "scale": "ratio"
            }
          }
        },
        "d": {
          "grain": "unknown",
          "fields": {
            "total": {
              "scale": "ratio"
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "a",
        "field": "amount",
        "op": "sum"
      },
      {
        "kind": "aggregate",
        "relation": "b",
        "field": "amount",
        "op": "sum"
      },
      {
        "kind": "rollup",
        "relation": "c",
        "field": "total",
        "toGrain": [],
        "op": "sum"
      },
      {
        "kind": "rollup",
        "relation": "d",
        "field": "total",
        "toGrain": [],
        "op": "sum"
      }
    ]
  },
  {
    "id": "FX_S_MIXED_FAULT",
    "structure": {
      "relations": {
        "p": {
          "grain": "unknown",
          "fields": {
            "total": {
              "scale": "ratio"
            }
          }
        },
        "q": {
          "grain": [
            "id"
          ],
          "fields": {
            "id": {
              "scale": "nominal",
              "key": true
            },
            "rating": {
              "scale": "ordinal",
              "order": {
                "kind": "total",
                "values": [
                  1,
                  2,
                  3
                ]
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "rollup",
        "relation": "p",
        "field": "total",
        "toGrain": [],
        "op": "sum"
      },
      {
        "kind": "aggregate",
        "relation": "q",
        "field": "rating",
        "op": "mean"
      }
    ]
  },
  {
    "id": "FX_S_HETEROGENEOUS_OBSERVATIONS",
    "structure": {
      "relations": {
        "readings": {
          "grain": [
            "reading_id"
          ],
          "fields": {
            "reading_id": {
              "scale": "nominal",
              "key": true
            },
            "temp": {
              "scale": "interval",
              "unit": {
                "dimension": "temperature",
                "unit": "celsius"
              },
              "permits": {
                "provenance": [
                  "observed",
                  "imputed"
                ],
                "null": [
                  "censored"
                ],
                "uncertainty": [
                  "none",
                  "measurement-error"
                ]
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "readings",
        "field": "temp",
        "op": "mean"
      }
    ],
    "evidence": {
      "rows": {
        "readings": [
          {
            "reading_id": "r1",
            "temp": 20.5
          },
          {
            "reading_id": "r2",
            "temp": {
              "value": 21,
              "provenance": "imputed"
            }
          },
          {
            "reading_id": "r3",
            "temp": {
              "null": "censored"
            }
          },
          {
            "reading_id": "r4",
            "temp": {
              "value": 19.2,
              "uncertainty": {
                "kind": "measurement-error",
                "error": 0.3
              }
            }
          }
        ]
      }
    }
  },
  {
    "id": "FX_S_RENAME_ORIGINAL",
    "structure": {
      "relations": {
        "weather": {
          "grain": [
            "customer_id"
          ],
          "fields": {
            "customer_id": {
              "scale": "nominal",
              "key": true
            },
            "temperature": {
              "scale": "interval",
              "unit": {
                "dimension": "temperature",
                "unit": "celsius"
              }
            },
            "revenue": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "unit": "USD"
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "weather",
        "field": "temperature",
        "op": "sum"
      },
      {
        "kind": "aggregate",
        "relation": "weather",
        "field": "revenue",
        "op": "mean"
      },
      {
        "kind": "aggregate",
        "relation": "weather",
        "field": "customer_id",
        "op": "count"
      }
    ]
  },
  {
    "id": "FX_S_ADVERSARIAL_NAMES",
    "structure": {
      "relations": {
        "kpis": {
          "grain": [
            "id"
          ],
          "fields": {
            "id": {
              "scale": "nominal",
              "key": true
            },
            "revenue": {
              "scale": "ordinal",
              "order": {
                "kind": "total",
                "values": [
                  1,
                  2,
                  3,
                  4,
                  5
                ]
              }
            },
            "satisfaction_score": {
              "scale": "ratio"
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "kpis",
        "field": "revenue",
        "op": "mean"
      },
      {
        "kind": "aggregate",
        "relation": "kpis",
        "field": "satisfaction_score",
        "op": "mean"
      }
    ]
  },
  {
    "id": "FX_P_CATEGORICAL_VS_RATIO",
    "structure": {
      "relations": {
        "sales": {
          "grain": [
            "region"
          ],
          "fields": {
            "region": {
              "scale": "nominal",
              "key": true
            },
            "amount": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "unit": "USD"
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "sales",
        "field": "amount",
        "op": "sum"
      }
    ],
    "evidence": {
      "rows": {
        "sales": [
          {
            "region": "north",
            "amount": 1200
          },
          {
            "region": "south",
            "amount": 860
          },
          {
            "region": "west",
            "amount": 1410
          }
        ]
      }
    }
  },
  {
    "id": "FX_P_BINNED_INTERVAL",
    "structure": {
      "relations": {
        "bins": {
          "grain": [
            "bucket"
          ],
          "fields": {
            "bucket": {
              "scale": "ratio",
              "shape": "interval",
              "unit": {
                "dimension": "time",
                "unit": "year"
              }
            },
            "n": {
              "scale": "count"
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "bins",
        "field": "n",
        "op": "sum"
      }
    ],
    "evidence": {
      "rows": {
        "bins": [
          {
            "bucket": "[0,18)",
            "n": 42
          },
          {
            "bucket": "[18,65)",
            "n": 311
          },
          {
            "bucket": "[65,120)",
            "n": 57
          }
        ]
      }
    }
  },
  {
    "id": "FX_P_OHLC",
    "structure": {
      "relations": {
        "candles": {
          "grain": [
            "symbol",
            "period"
          ],
          "fields": {
            "symbol": {
              "scale": "nominal"
            },
            "period": {
              "scale": "interval",
              "shape": "interval",
              "temporality": {
                "kind": "interval",
                "closure": "half-open",
                "grain": "day"
              }
            },
            "open": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "unit": "USD"
              }
            },
            "high": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "unit": "USD"
              }
            },
            "low": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "unit": "USD"
              }
            },
            "close": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "unit": "USD"
              }
            },
            "volume": {
              "scale": "count"
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "candles",
        "field": "high",
        "op": "max"
      }
    ],
    "evidence": {
      "rows": {
        "candles": [
          {
            "symbol": "FSDS",
            "period": "2026-09-01",
            "open": 10.2,
            "high": 10.9,
            "low": 9.8,
            "close": 10.6,
            "volume": 1200
          },
          {
            "symbol": "FSDS",
            "period": "2026-09-02",
            "open": 10.6,
            "high": 11.4,
            "low": 10.5,
            "close": 11.1,
            "volume": 1750
          }
        ]
      }
    }
  },
  {
    "id": "FX_P_HIERARCHY",
    "structure": {
      "relations": {
        "accounts": {
          "grain": [
            "id"
          ],
          "fields": {
            "id": {
              "scale": "nominal",
              "key": true
            },
            "parent": {
              "scale": "nominal",
              "permits": {
                "null": [
                  "not-applicable"
                ]
              }
            },
            "name": {
              "scale": "nominal"
            },
            "balance": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "unit": "USD"
              }
            }
          }
        }
      },
      "relationships": [
        {
          "from": {
            "relation": "accounts",
            "field": "parent"
          },
          "to": {
            "relation": "accounts",
            "field": "id"
          },
          "cardinality": "many-to-one"
        }
      ]
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "accounts",
        "field": "balance",
        "op": "sum"
      }
    ],
    "evidence": {
      "rows": {
        "accounts": [
          {
            "id": "root",
            "parent": {
              "null": "not-applicable"
            },
            "name": "All",
            "balance": 0
          },
          {
            "id": "a1",
            "parent": "root",
            "name": "Assets",
            "balance": 5000
          },
          {
            "id": "a11",
            "parent": "a1",
            "name": "Cash",
            "balance": 3000
          },
          {
            "id": "a12",
            "parent": "a1",
            "name": "Receivables",
            "balance": 2000
          }
        ]
      }
    }
  },
  {
    "id": "FX_P_GRAPH_ISOLATED_NODE",
    "structure": {
      "relations": {
        "nodes": {
          "grain": [
            "id"
          ],
          "fields": {
            "id": {
              "scale": "nominal",
              "key": true
            },
            "label": {
              "scale": "nominal"
            }
          }
        },
        "edges": {
          "grain": [
            "src",
            "dst"
          ],
          "fields": {
            "src": {
              "scale": "nominal"
            },
            "dst": {
              "scale": "nominal"
            },
            "weight": {
              "scale": "ratio"
            }
          }
        }
      },
      "relationships": [
        {
          "from": {
            "relation": "edges",
            "field": "src"
          },
          "to": {
            "relation": "nodes",
            "field": "id"
          },
          "cardinality": "many-to-one"
        },
        {
          "from": {
            "relation": "edges",
            "field": "dst"
          },
          "to": {
            "relation": "nodes",
            "field": "id"
          },
          "cardinality": "many-to-one"
        }
      ]
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "nodes",
        "field": "id",
        "op": "count"
      }
    ],
    "evidence": {
      "rows": {
        "nodes": [
          {
            "id": "n1",
            "label": "Contract"
          },
          {
            "id": "n2",
            "label": "IR"
          },
          {
            "id": "n3",
            "label": "Orphan"
          }
        ],
        "edges": [
          {
            "src": "n1",
            "dst": "n2",
            "weight": 1
          }
        ]
      }
    }
  },
  {
    "id": "FX_H_PAYROLL",
    "structure": {
      "relations": {
        "employees": {
          "grain": [
            "emp_id"
          ],
          "fields": {
            "emp_id": {
              "scale": "nominal",
              "key": true
            },
            "dept": {
              "scale": "nominal"
            },
            "salary": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "unit": "USD"
              }
            },
            "tenure_years": {
              "scale": "ratio",
              "temporality": {
                "kind": "duration",
                "grain": "year"
              }
            },
            "grade": {
              "scale": "ordinal",
              "order": {
                "kind": "total",
                "values": [
                  1,
                  2,
                  3,
                  4,
                  5
                ]
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "employees",
        "field": "salary",
        "op": "mean"
      },
      {
        "kind": "aggregate",
        "relation": "employees",
        "field": "grade",
        "op": "max"
      },
      {
        "kind": "aggregate",
        "relation": "employees",
        "field": "grade",
        "op": "mean"
      },
      {
        "kind": "aggregate",
        "relation": "employees",
        "field": "emp_id",
        "op": "sum"
      }
    ]
  },
  {
    "id": "FX_H_SENSOR_NETWORK",
    "structure": {
      "relations": {
        "sensors": {
          "grain": [
            "sensor_id",
            "hour"
          ],
          "fields": {
            "sensor_id": {
              "scale": "nominal"
            },
            "hour": {
              "scale": "cyclic",
              "period": 24
            },
            "temp": {
              "scale": "interval",
              "unit": {
                "dimension": "temperature",
                "unit": "celsius"
              },
              "permits": {
                "uncertainty": [
                  "measurement-error"
                ]
              }
            },
            "humidity": {
              "scale": "proportion",
              "whole": "saturation"
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "sensors",
        "field": "temp",
        "op": "mean",
        "uncertainty": "propagate"
      },
      {
        "kind": "aggregate",
        "relation": "sensors",
        "field": "hour",
        "op": "mean"
      },
      {
        "kind": "aggregate",
        "relation": "sensors",
        "field": "humidity",
        "op": "max"
      }
    ]
  },
  {
    "id": "FX_H_LEDGER_MULTI_CURRENCY_ROWS",
    "structure": {
      "relations": {
        "ledger": {
          "grain": [
            "entry_id"
          ],
          "fields": {
            "entry_id": {
              "scale": "nominal",
              "key": true
            },
            "amount": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "perRow": true,
                "conversions": {
                  "EUR": 1.08
                }
              }
            },
            "posted_at": {
              "scale": "interval",
              "temporality": {
                "kind": "instant",
                "grain": "second"
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "ledger",
        "field": "amount",
        "op": "sum"
      },
      {
        "kind": "aggregate",
        "relation": "ledger",
        "field": "posted_at",
        "op": "sum"
      }
    ],
    "evidence": {
      "rows": {
        "ledger": [
          {
            "entry_id": "e1",
            "amount": {
              "value": 250,
              "unit": "EUR"
            },
            "posted_at": "2026-08-30T09:00:00Z"
          },
          {
            "entry_id": "e2",
            "amount": {
              "value": 120,
              "unit": "USD"
            },
            "posted_at": "2026-08-30T10:30:00Z"
          },
          {
            "entry_id": "e3",
            "amount": {
              "value": 80,
              "unit": "EUR"
            },
            "posted_at": "2026-08-31T08:15:00Z"
          }
        ]
      }
    }
  },
  {
    "id": "FX_H_CENSUS_CELLS_WITNESSED",
    "structure": {
      "relations": {
        "cells": {
          "grain": "unknown",
          "fields": {
            "tract": {
              "scale": "nominal"
            },
            "pop": {
              "scale": "count",
              "permits": {
                "null": [
                  "suppressed"
                ]
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "cells",
        "field": "pop",
        "op": "sum",
        "nulls": "exclude"
      }
    ],
    "evidence": {
      "grainWitness": {
        "cells": [
          "tract"
        ]
      },
      "rows": {
        "cells": [
          {
            "tract": "t01",
            "pop": 1250
          },
          {
            "tract": "t02",
            "pop": {
              "null": "suppressed"
            }
          },
          {
            "tract": "t03",
            "pop": 980
          }
        ]
      }
    }
  },
  {
    "id": "FX_H_MARKET_SHARE_ROLLUP",
    "structure": {
      "relations": {
        "shares": {
          "grain": [
            "company",
            "market",
            "year"
          ],
          "fields": {
            "company": {
              "scale": "nominal"
            },
            "market": {
              "scale": "nominal"
            },
            "year": {
              "scale": "interval",
              "temporality": {
                "kind": "instant",
                "grain": "year"
              }
            },
            "share": {
              "scale": "proportion",
              "whole": {
                "perRow": "market"
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "shares",
        "field": "share",
        "op": "sum",
        "along": [
          "market"
        ]
      },
      {
        "kind": "aggregate",
        "relation": "shares",
        "field": "share",
        "op": "mean"
      }
    ]
  },
  {
    "id": "FX_H_CLINICAL_TRIAL",
    "structure": {
      "relations": {
        "subjects": {
          "grain": [
            "subject_id"
          ],
          "fields": {
            "subject_id": {
              "scale": "nominal",
              "key": true
            },
            "arm": {
              "scale": "nominal"
            },
            "survival_days": {
              "scale": "ratio",
              "temporality": {
                "kind": "duration",
                "grain": "day"
              },
              "permits": {
                "null": [
                  "censored"
                ]
              }
            },
            "dose": {
              "scale": "ratio",
              "unit": {
                "dimension": "mass",
                "unit": "mg"
              },
              "permits": {
                "uncertainty": [
                  "rounded"
                ]
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "subjects",
        "field": "survival_days",
        "op": "mean",
        "nulls": "as-observed"
      },
      {
        "kind": "aggregate",
        "relation": "subjects",
        "field": "dose",
        "op": "sum",
        "uncertainty": "drop"
      },
      {
        "kind": "aggregate",
        "relation": "subjects",
        "field": "arm",
        "op": "count"
      }
    ],
    "evidence": {
      "rows": {
        "subjects": [
          {
            "subject_id": "p1",
            "arm": "treatment",
            "survival_days": 210,
            "dose": {
              "value": 50,
              "uncertainty": {
                "kind": "rounded"
              }
            }
          },
          {
            "subject_id": "p2",
            "arm": "control",
            "survival_days": {
              "null": "censored"
            },
            "dose": {
              "value": 0,
              "uncertainty": {
                "kind": "rounded"
              }
            }
          },
          {
            "subject_id": "p3",
            "arm": "treatment",
            "survival_days": 365,
            "dose": {
              "value": 50,
              "uncertainty": {
                "kind": "rounded"
              }
            }
          }
        ]
      }
    }
  },
  {
    "id": "FX_H_KPI_INDEX_AND_RATE",
    "structure": {
      "relations": {
        "kpis": {
          "grain": [
            "region",
            "quarter"
          ],
          "fields": {
            "region": {
              "scale": "nominal"
            },
            "quarter": {
              "scale": "interval",
              "temporality": {
                "kind": "instant",
                "grain": "quarter"
              }
            },
            "cost": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "unit": "USD"
              }
            },
            "units": {
              "scale": "count"
            },
            "cost_per_unit": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "unit": "USD"
              },
              "additivity": {
                "kind": "ratio-measure",
                "numerator": "cost",
                "denominator": "units"
              }
            },
            "price_index": {
              "scale": "index"
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "rollup",
        "relation": "kpis",
        "field": "cost_per_unit",
        "toGrain": [
          "quarter"
        ],
        "op": "sum"
      },
      {
        "kind": "aggregate",
        "relation": "kpis",
        "field": "price_index",
        "op": "max"
      }
    ]
  },
  {
    "id": "FX_H_INVENTORY_VALUE_UNKNOWN_UNIT",
    "structure": {
      "relations": {
        "stock": {
          "grain": [
            "sku",
            "day"
          ],
          "fields": {
            "sku": {
              "scale": "nominal"
            },
            "day": {
              "scale": "interval",
              "temporality": {
                "kind": "instant",
                "grain": "day"
              }
            },
            "on_hand": {
              "scale": "count",
              "additivity": {
                "kind": "semi-additive",
                "nonAdditiveAlong": [
                  "day"
                ]
              }
            },
            "value": {
              "scale": "ratio",
              "unit": {
                "dimension": "currency",
                "perRow": true
              }
            }
          }
        }
      }
    },
    "assertions": [
      {
        "kind": "aggregate",
        "relation": "stock",
        "field": "on_hand",
        "op": "sum",
        "along": [
          "sku"
        ]
      },
      {
        "kind": "aggregate",
        "relation": "stock",
        "field": "value",
        "op": "sum",
        "along": [
          "sku"
        ]
      }
    ]
  }
];
