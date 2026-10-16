// Capture the pre-update bytes before any legacy initializer/autosave can run.
let townBootRaw=null;
try{townBootRaw=localStorage.getItem('kotoba_shop_v1');if(townBootRaw&&!localStorage.getItem('kotoba_shop_before_v3'))localStorage.setItem('kotoba_shop_before_v3',townBootRaw);}catch{}
const townNewGame=townBootRaw===null;
