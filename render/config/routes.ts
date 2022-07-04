export default [
    /* {
        path: '/',
        component: './404',
        wrappers: ['@/wrappers/auth'],
    }, */
    {
        path: '/user',
        layout: false,
        component: './user',
        routes: [
            {
                path: '/user',
                routes: [
                    {
                        name: 'login',
                        path: '/user/login',
                        component: './user/login',
                    },
                    {
                        name: 'login',
                        path: '/user/logout',
                        component: './user/logout',
                    },
                    {
                        path: '/user/domain/register',
                        name: 'register',
                        component: './domain/register',
                    },
                    {
                        path: '/user/domain/register/result',
                        name: 'result',
                        component: './domain/register/result',
                    },
                ],
            },
            {
                component: './404',
            },
        ],
    },
    {
        name: 'workassigned',
        path: 'workassigned',
        component: './WorkAssigned',
        access: 'DomainUser',
        routes: [
            {
                name: 'adminconsole',
                path: 'adminconsole',
                icon: 'adminconsole|icon',
                access: 'MgtByAdmin',
                routes: [
                    {
                        name: 'dashboard',
                        icon: 'dashboard|icon',
                        path: 'dashboard',
                        component: './Dashboard',
                    },
                    {
                        name: 'users',
                        icon: 'users|icon',
                        path: 'users',
                        component: './Users',
                    },
                    {
                        name: 'groups',
                        icon: 'teams|icon',
                        path: 'groups',
                        component: './Groups',
                    },
                    {
                        path: 'clients',
                        name: 'machines',
                        icon: 'machines|icon',
                        component: './Clients/Mock',
                    },
                    {
                        name: 'entries',
                        icon: 'logins|icon',
                        path: 'entries',
                        component: './VaultItems',
                    },
                    {
                        name: 'reports',
                        icon: 'reports|icon',
                        path: 'reports',
                        component: './Reports',
                    },
                    {
                        name: 'domain',
                        icon: 'global|icon',
                        path: 'domain/profile',
                        component: './domain/profile',
                        access: 'MgtByOwner',
                    },
                ],
            },
            {
                name: 'menus',
                path: 'menus',
                routes: [
                    {
                        name: 'tools',
                        path: 'tools',
                        routes: [
                            {
                                name: 'passwordGenerator',
                                icon: 'passwordGenerator|icon',
                                path: 'passwordgenerator',
                                component: './Tools/PasswordGenerator',
                            },
                            // {
                            //     name: 'passwordHealth',
                            //     icon: 'passwordHealth|icon',
                            //     path: 'passwordhealth',
                            // },
                            // {
                            //     name: 'dataBreachScanner',
                            //     icon: 'dataBreachScanner|icon',
                            //     path: 'databreachscanner',
                            // },
                            // {
                            //     name: 'dataStorage',
                            //     icon: 'DataStorage|icon',
                            //     path: 'datastorage',
                            // },
                        ],
                    },

                    {
                        name: 'quickerfinder',
                        path: 'quickerfinder',
                        routes: [
                            {
                                name: 'favourites',
                                path: 'favourites',
                                icon: 'star|icon',
                                component: './Home/WorkFavourites',
                            },
                            {
                                name: 'tags',
                                path: 'tags/:id',
                                icon: 'tag|icon',
                                component: './Home/WorkAssigned/Tags',
                            },
                        ],
                    },
                ],
            },
            {
                name: 'navigator',
                path: 'navigator',
                routes: [
                    {
                        name: 'apps',
                        icon: 'apps|icon',
                        path: 'apps',
                        component: './Home/WorkAssigned/Apps',
                    },
                    {
                        name: 'cryptoWallet',
                        icon: 'cryptoWallet|icon',
                        path: 'cryptoWallet',
                        //component: './Home/Personal/PersonalInfo'
                    },
                    {
                        name: 'cryptoAddress',
                        icon: 'cryptoAddress|icon',
                        path: 'cryptoAddress',
                        //component: './Home/Personal/PersonalInfo'
                    },
                    {
                        name: 'secureNote',
                        icon: 'secureNote|icon',
                        path: 'secureNotes',
                        //component: './Home/Personal/SecureNotes'
                    },
                    {
                        name: 'creditCard',
                        icon: 'creditCard|icon',
                        path: 'creditCard',
                        //component: './Home/Personal/CreditCard'
                    },
                    {
                        name: 'personalInfo',
                        icon: 'personalInfo|icon',
                        path: 'personalInfo',
                        //component: './Home/Personal/PersonalInfo'
                    },
                ],
            },
            {
                name: 'allItems',
                icon: 'allItems|icon',
                path: 'allItems',
                component: './Home/WorkAssigned/Apps',
            },
        ],
    },
    {
        name: 'personal',
        path: 'personal',
        access: 'PersonalUser',
        component: './Personal',
        routes: [
            {
                name: 'menus',
                path: 'menus',
                routes: [
                    {
                        name: 'tools',
                        path: 'tools',
                        routes: [
                            {
                                name: 'passwordGenerator',
                                icon: 'passwordGenerator|icon',
                                path: 'passwordgenerator',
                                component: './Tools/PasswordGenerator',
                            },
                            {
                                name: 'accountGenerator',
                                icon: 'accountGenerator|icon',
                                path: 'accountGenerator',
                                component: './Tools/AccountGenerator',
                            },
                            {
                                name: 'passwordHealth',
                                icon: 'passwordHealth|icon',
                                path: 'passwordHealth',
                                component: './Tools/PasswordHealth',
                            },
                            // {
                            //     name: 'dataBreachScanner',
                            //     icon: 'dataBreachScanner|icon',
                            //     path: 'databreachscanner',
                            // },

                            // {
                            //     name: 'dataStorage',
                            //     icon: 'DataStorage|icon',
                            //     path: 'datastorage',
                            // },
                        ],
                    },
                    {
                        name: 'quickerfinder',
                        path: 'quickerfinder',
                        routes: [
                            {
                                name: 'favourites',
                                path: 'favourites',
                                icon: 'star|icon',
                                component: './Home/PersonalFavourites',
                            },
                            {
                                name: 'tags',
                                path: 'tags/:id',
                                icon: 'tag|icon',
                                component: './Home/Personal/Tags',
                            },
                        ],
                    },
                ],
            },
            {
                name: 'navigator',
                path: 'navigator',
                routes: [
                    {
                        name: 'apps',
                        icon: 'apps|icon',
                        path: 'apps',
                        component: './Home/Personal/Apps',
                    },
                    {
                        name: 'cryptoWallet',
                        icon: 'cryptoWallet|icon',
                        path: 'cryptoWallet',
                        component: './Home/Personal/Wallet',
                    },
                    {
                        name: 'cryptoAddress',
                        icon: 'cryptoAddress|icon',
                        path: 'cryptoAddress',
                        component: './Home/Personal/Addresses',
                    },
                    {
                        name: 'secureNotes',
                        icon: 'secureNote|icon',
                        path: 'secureNotes',
                        component: './Home/Personal/SecureNotes',
                    },
                    {
                        name: 'creditCard',
                        icon: 'creditCard|icon',
                        path: 'creditCard',
                        component: './Home/Personal/CreditCard',
                    },
                    {
                        name: 'personalInfo',
                        icon: 'personalInfo|icon',
                        path: 'personalInfo',
                        component: './Home/Personal/PersonalInfo',
                    },
                ],
            },
            {
                name: 'allItems',
                icon: 'allItems|icon',
                path: 'allItems',
                component: './Home/Personal/AllItems',
            },
        ],
    },
    {
        path: '/401',
        component: './401',
    },
    {
        component: './404',
    },
];
