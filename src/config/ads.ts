export const AD_CONFIG = {
    // Global switch to turn off all ads instantly (e.g. for premium users or emergency)
    enabled: true,

    // Google AdSense Publisher ID
    publisherId: 'ca-pub-5099892029462046', // REPLACE WITH REAL ID

    // Ad Units
    slots: {
        home_hero_bottom: {
            id: 'home_hero_bottom',
            adUnitId: '1234567890', // REPLACE
            format: 'auto',
            responsive: true
        },
        tracking_result_sidebar: {
            id: 'tracking_result_sidebar',
            adUnitId: '0987654321', // REPLACE
            format: 'rectangle',
            responsive: false,
            style: { width: '300px', height: '250px' }
        },
        blog_content_middle: {
            id: 'blog_content_middle',
            adUnitId: '1122334455', // REPLACE
            format: 'fluid',
            layoutKey: '-fb+5w+4e-db+86'
        }
    }
}
