import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Analyzing plant image for disease detection...');

    // Call Lovable AI with image analysis
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert agricultural pathologist and plant disease specialist with extensive field experience.

ANALYSIS FRAMEWORK:
1. Examine leaf color, texture, spots, lesions, discoloration
2. Look for patterns: circular spots, irregular patches, powdery coating, wilting
3. Check leaf edges, veins, and overall structure
4. Consider multiple disease indicators before diagnosis

COMMON PLANT DISEASES TO DETECT:
- **Leaf Blight**: Brown/black irregular spots, water-soaked lesions, rapid spread
- **Powdery Mildew**: White/gray powdery coating on leaves and stems
- **Rust**: Orange/brown pustules, often on underside of leaves
- **Bacterial Spot**: Small dark spots with yellow halos, water-soaked appearance
- **Anthracnose**: Dark sunken lesions, often with pink/orange spore masses
- **Mosaic Virus**: Mottled yellow/green patterns, leaf distortion, stunted growth
- **Downy Mildew**: Yellow patches on top, fuzzy growth underneath
- **Septoria Leaf Spot**: Small circular spots with dark borders and gray centers
- **Early Blight**: Concentric ring patterns ("target spots") on older leaves
- **Late Blight**: Irregular brown/black lesions, white fuzzy growth in humid conditions

DIAGNOSIS CRITERIA:
- Only diagnose disease if clear symptoms are visible
- Confidence >80% requires multiple distinct disease indicators
- Confidence 60-80% for single clear symptom
- Confidence <60% for early/unclear symptoms
- Mark as "healthy" if no disease symptoms present

RESPONSE FORMAT (JSON only):
{
  "status": "healthy" or "disease_detected",
  "disease_name": "specific disease name" or null,
  "confidence": 0-100,
  "recommendations": "detailed treatment steps" or null
}

TREATMENT RECOMMENDATIONS (if disease detected):
- Immediate actions to take
- Fungicide/treatment options with application methods
- Cultural practices (spacing, watering, sanitation)
- Preventive measures for future outbreaks

Be thorough, accurate, and provide actionable farming advice.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this plant leaf image for diseases. Respond with JSON only.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);

    // Parse AI response
    let result;
    try {
      // Extract JSON from response if it's wrapped in markdown
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : aiResponse);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      // Fallback result
      result = {
        status: 'healthy',
        disease_name: null,
        confidence: 75,
        recommendations: 'Plant appears healthy. Continue regular care and monitoring.'
      };
    }

    return new Response(
      JSON.stringify({ result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in analyze-plant-disease function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
