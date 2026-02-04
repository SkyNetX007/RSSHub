import { Route, ViewType } from '@/types';
import { Context } from 'hono';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/story',
    categories: ['reading'],
    view: ViewType.Articles,
    example: '/sizefiction/story',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
    },
    radar: [
        {
            source: ['sizefiction.net/story'],
            target: '/story',
        },
    ],
    name: 'Stories',
    maintainers: ['SkyNetX007'],
    handler,
};

async function handler(ctx: Context) {
    const rootUrl = 'https://sizefiction.net';

    const targetUrl = `${rootUrl}/story`;

    const response = await ofetch(targetUrl);
    const $ = load(response);

    const items = $('.story-item')
        .toArray()
        .map((item) => {
            const el = $(item);
            const titleEl = el.find('.story-header');

            const dateText = el.find('span:contains("Added:"), span:contains("Updated:")').text();
            const dateStr = dateText.replace(/(Added:|Updated:|\n)/g, '').trim();

            const summary = el.find('.story-summary').html() || '';

            return {
                title: titleEl.text().trim(),
                link: new URL(titleEl.attr('href') || '', rootUrl).href,
                author: el.find('a[href^="/author/profile/"]').text().trim(),
                description: summary,
                pubDate: parseDate(dateStr),
                category: el
                    .find('.tags .tag')
                    .toArray()
                    .map((t) => $(t).text().trim()),
            };
        });

    return {
        title: 'SizeFiction - Stories',
        link: targetUrl,
        item: items,
    };
}