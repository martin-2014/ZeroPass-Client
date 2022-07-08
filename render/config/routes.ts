export default [
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
                            {
                                name: 'dataStorage',
                                icon: 'DataStorage|icon',
                                path: 'datastorage',
                                component: './Tools/DataStorage',
                            },
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
