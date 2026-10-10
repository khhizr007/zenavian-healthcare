/**
 * Poultry Healthcare Solutions content (structured so it can be translated later).
 * DRAFT written conservatively from the brief: client review required (see docs/CLIENT-TODO.md).
 * Guardrails: no cure/guarantee claims, no dosing, no statistics, no routine antibiotic messaging.
 */
export interface Section {
  id: string;
  title: string;
  challenge: string;
  matters: string;
  signs: string[];
  support: string;
  /** product slugs; empty = "Contact us for guidance" */
  products: string[];
}

export const overview = [
  {
    id: 'poultry-therapeutics',
    title: 'Poultry Therapeutics',
    text: 'ZenAvian Healthcare offers therapeutic products for poultry. Each product should be used only as per its approved label and under the guidance of a qualified veterinarian.',
  },
  {
    id: 'veterinary-pharmaceuticals',
    title: 'Veterinary Pharmaceuticals',
    text: 'Our veterinary pharmaceutical products are sourced from carefully selected international manufacturing partners and handled according to applicable quality and regulatory requirements.',
  },
];

export const sections: Section[] = [
  {
    id: 'coccidiosis-management',
    title: 'Coccidiosis Management',
    challenge:
      'Coccidiosis is an intestinal disease of poultry caused by Eimeria parasites. Birds pick up the parasite from contaminated litter, feed or water.',
    matters:
      'Intestinal damage can reduce feed intake and nutrient absorption and can open the door to other gut problems, which affects flock uniformity and performance.',
    signs: [
      'Ruffled feathers and reduced activity',
      'Reduced feed intake',
      'Loose or watery droppings, sometimes with blood',
      'Uneven growth within the flock',
    ],
    support:
      'Cox Zen is positioned for coccidiosis management. It is one part of a wider approach that includes litter and moisture management, hygiene and veterinary advice.',
    products: ['cox-zen'],
  },
  {
    id: 'respiratory-health',
    title: 'Respiratory Health',
    challenge:
      'Respiratory challenges in poultry can involve several pathogens together with environmental factors such as ammonia, dust, ventilation and stress.',
    matters:
      'Respiratory disease can slow growth, increase mortality risk and reduce flock performance, and it often needs a careful look at both the birds and the house.',
    signs: [
      'Coughing and sneezing',
      'Nasal or eye discharge',
      'Rales (noisy breathing)',
      'Reduced feed intake and activity',
    ],
    support:
      'Pulmo Zen is designed as a respiratory-health solution, and Bact-T Drop is positioned for CRD and infectious coryza-related bacterial challenges.',
    products: ['pulmo-zen', 'bact-t-drop'],
  },
  {
    id: 'gut-health',
    title: 'Gut Health',
    challenge:
      'A healthy gut helps birds digest feed and absorb nutrients. Feed quality, water quality, litter condition, stress and infections can all affect it.',
    matters:
      'Gut disturbances often show up first as changes in droppings, feed conversion or flock uniformity, and they can predispose birds to other problems.',
    signs: [
      'Wet or abnormal droppings',
      'Undigested feed in droppings',
      'Reduced weight gain or uneven flock',
      'Reduced water or feed intake',
    ],
    support:
      'Gut health depends on good management and the right diagnosis. Contact us for guidance.',
    products: [],
  },
  {
    id: 'bacterial-health',
    title: 'Bacterial Health Challenges (E. coli, Infectious Coryza)',
    challenge:
      'E. coli (colibacillosis) and infectious coryza are bacterial challenges in poultry. They often follow stress, poor ventilation or other primary problems, and may occur together with other infections.',
    matters:
      'Bacterial complications can add to mortality, condemnations and loss of performance, and accurate diagnosis matters because several diseases look alike.',
    signs: [
      'Swelling around the face or eyes',
      'Nasal discharge and sneezing',
      'Depression and reduced feed intake',
      'Respiratory signs and air-sac or liver lesions found on examination',
    ],
    support:
      'Allbact-Z is positioned for bacterial-health challenges, including E. coli and coryza, according to its approved product indications. Bact-T Drop supports CRD and infectious coryza-related challenges.',
    products: ['allbact-z', 'bact-t-drop'],
  },
  {
    id: 'nutrition-supportive-care',
    title: 'Poultry Nutrition & Supportive Care',
    challenge:
      'Balanced nutrition, clean water, comfortable housing and good biosecurity form the base of flock health. Supportive care helps birds cope during challenges.',
    matters:
      'Even the best therapeutic product works best on a farm with consistent feed quality, water hygiene and sound management.',
    signs: [
      'Poor feed conversion',
      'Uneven body weights',
      'Slow recovery after a health challenge',
    ],
    support: 'Our focus on nutrition and supportive care is growing. Contact us for guidance.',
    products: [],
  },
];

export const faqs = [
  {
    q: 'Why is accurate diagnosis important before using any poultry product?',
    a: 'Many poultry diseases look similar and can occur together. A veterinarian can confirm the cause, which helps choose the right approach and avoids unnecessary use of medicines.',
  },
  {
    q: 'Where can I find composition, dosage and withdrawal period for a product?',
    a: 'These details are as approved on the product label. Please refer to the label or contact us. We do not publish them on the website unless they match the approved label.',
  },
  {
    q: 'What is a withdrawal period and why does it matter?',
    a: 'A withdrawal period is the time that must pass after treatment before eggs or meat may enter the food chain. Always follow the period stated on the product label.',
  },
  {
    q: 'Can a product replace good farm management?',
    a: 'No. Hygiene, ventilation, litter, water and feed quality, and biosecurity remain the foundation of flock health. Products support good management and do not replace it.',
  },
  {
    q: 'What is the difference between CRD and infectious coryza?',
    a: 'Both can cause respiratory signs such as coughing, sneezing and nasal discharge. They have different causes and can occur together, so laboratory or veterinary diagnosis is important.',
  },
  {
    q: 'Do you supply directly to farms?',
    a: 'We work with veterinarians, distributors and dealers across India. Send us an enquiry and we will guide you on the best way to access our products.',
  },
  {
    q: 'How can I report a problem with a product?',
    a: 'Use our adverse-event page to share the product name, batch number and a description. We take every report seriously.',
  },
];

export const responsibleUse =
  'Use products only as per the approved label and veterinary advice, and follow the stated withdrawal periods. This page is educational and is not a substitute for a veterinarian’s diagnosis.';
