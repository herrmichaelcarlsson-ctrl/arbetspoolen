import { NextRequest, NextResponse } from 'next/server';

const AF_API_BASE = 'https://api.arbetsformedlingen.se';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const city = searchParams.get('city') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query for AF API
    const params = new URLSearchParams();
    if (keyword) params.set('yrkesbenamning', keyword);
    if (city) params.set('municipality', city);
    params.set('offset', '0');
    params.set('limit', limit.toString());

    const response = await fetch(`${AF_API_BASE}/platsannonser/v1/sok`, {
      headers: {
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.AF_API_KEY || ''
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      console.error('AF API error:', response.status);
      return NextResponse.json({ vacancies: [], error: 'AF API unavailable' }, { status: 200 });
    }

    const data = await response.json();

    const vacancies = (data?.data || []).map((v: any) => ({
      id: v.id,
      title: v.headline || 'Ledig tjänst',
      company: v.employer?.name || 'Ej angivet',
      city: v.workplaceAddress?.municipality || city || 'Sverige',
      occupation: v.occupation || keyword,
      posted: v.publicationDate,
      expires: v.lastApplicationDate,
      link: `https://arbetsformedlingen.se/platsbanken/annons/${v.id}`,
    }));

    return NextResponse.json({
      count: vacancies.length,
      vacancies
    });
  } catch (err) {
    console.error('AF API error:', err);
    return NextResponse.json({ vacancies: [] }, { status: 200 });
  }
}
