/**
 * 必要な環境変数が設定されているかチェックするユーティリティ関数
 */
export function checkRequiredEnvVars(): { success: boolean; errors: string[] } {
    const requiredVars = [
        'AWS_REGION',
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'GEMINI_API_KEY'
    ];

    const missingVars = requiredVars.filter(name => !process.env[name]);

    return {
        success: missingVars.length === 0,
        errors: missingVars.map(name => `環境変数${name}が設定されていません`)
    };
}

/**
 * 環境変数のステータスを返す
 */
export function getEnvironmentStatus(): {
    aws: { configured: boolean; region?: string };
    gemini: { configured: boolean };
} {
    return {
        aws: {
            configured: !!(
                process.env.AWS_REGION &&
                process.env.AWS_ACCESS_KEY_ID &&
                process.env.AWS_SECRET_ACCESS_KEY
            ),
            region: process.env.AWS_REGION
        },
        gemini: {
            configured: !!process.env.GEMINI_API_KEY
        }
    };
}
