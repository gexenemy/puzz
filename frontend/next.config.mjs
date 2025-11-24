/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
            { protocol: 'http', hostname: '**' },
        ],
    },
    webpack: (config, { isServer }) => {
        // Точечно подменяем только Node-вход Konva на браузерный
        config.resolve.alias = {
            ...(config.resolve.alias || {}),
            'konva/lib/index-node.js': 'konva/lib/index.js',
        };

        // На серверной сборке не пытаться резолвить нативный 'canvas'
        if (isServer) {
            config.externals = config.externals || [];
            config.resolve.alias = {
                ...(config.resolve.alias || {}),
                canvas: false,
            };
        }
        return config;
    },
};

export default nextConfig;
