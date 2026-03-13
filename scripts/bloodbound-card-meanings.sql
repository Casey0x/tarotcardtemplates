-- Bloodbound Tarot: full SEO card meaning rows for spotlight cards
-- Run in Supabase SQL Editor. Uses ON CONFLICT to insert or update.
-- Images: template-previews/BLOODBOUND-TAROT/*.jpg

DO $$
BEGIN
  -- Justice (Major Arcana XI)
  INSERT INTO card_meanings (
    slug, name, number, arcana,
    upright_keywords, reversed_keywords,
    upright_meaning, reversed_meaning,
    love, career, health, yes_or_no, as_a_person, feelings, advice,
    featured_image_url
  ) VALUES (
    'justice',
    'Justice',
    'XI',
    'major',
    ARRAY['balance', 'truth', 'karma', 'fairness', 'integrity', 'cause and effect'],
    ARRAY['injustice', 'dishonesty', 'unfairness', 'avoiding accountability'],
    'Justice represents balance, truth, and karmic fairness. When this card appears upright, it suggests that cause and effect are at work and that fair outcomes are within reach. Decisions made with integrity will be rewarded, and the truth will come to light. This is a card of accountability and moral clarity.',
    'Reversed, Justice can indicate unfairness, dishonesty, or a lack of accountability. You may be avoiding a necessary truth or feeling that outcomes have been unjust. It can also suggest that legal or ethical matters are delayed or skewed. The card asks you to seek clarity and act with integrity even when the path is unclear.',
    'In love, Justice upright points to relationship balance, honest communication, and fair treatment between partners. It can indicate a relationship built on mutual respect or the need to address an imbalance. Reversed, it may suggest dishonesty, unresolved conflict, or one partner feeling unheard or unfairly treated.',
    'In career readings, Justice upright suggests fair evaluation, contracts, or promotions based on merit. Legal or compliance matters may be in focus. Reversed, it can indicate workplace unfairness, disputes, or the need to document your contributions and seek equitable treatment.',
    'In health contexts, Justice can point to the need for balance in lifestyle, diet, or treatment. It may also relate to second opinions or ensuring your care is fair and thorough. Reversed, it may suggest misdiagnosis or the need to advocate for yourself in a medical or wellness setting.',
    'Justice in a yes-or-no reading often leans toward yes when you have acted with integrity; otherwise it can suggest a delayed or conditional outcome until balance is restored.',
    'As a person, Justice represents someone fair-minded, principled, and committed to truth. They may work in law, ethics, or any field where balance and accountability matter. They can be exacting and sometimes rigid when they perceive unfairness.',
    'When Justice represents feelings, it suggests the person feels the relationship is — or should be — fair and honest. They may be weighing their commitment or seeking clarity about where they stand. Reversed, they may feel wronged or uncertain about your sincerity.',
    'Justice advises you to act with integrity, seek the truth, and restore balance where it has been lost. Make decisions you can stand behind and be willing to accept the consequences of your actions.'
  , 'https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/BLOODBOUND-TAROT/justice.jpg'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    number = EXCLUDED.number,
    arcana = EXCLUDED.arcana,
    upright_keywords = EXCLUDED.upright_keywords,
    reversed_keywords = EXCLUDED.reversed_keywords,
    upright_meaning = EXCLUDED.upright_meaning,
    reversed_meaning = EXCLUDED.reversed_meaning,
    love = EXCLUDED.love,
    career = EXCLUDED.career,
    health = EXCLUDED.health,
    yes_or_no = EXCLUDED.yes_or_no,
    as_a_person = EXCLUDED.as_a_person,
    feelings = EXCLUDED.feelings,
    advice = EXCLUDED.advice,
    featured_image_url = EXCLUDED.featured_image_url,
    updated_at = now();

  -- Seven of Swords (Minor Arcana)
  INSERT INTO card_meanings (
    slug, name, number, arcana,
    upright_keywords, reversed_keywords,
    upright_meaning, reversed_meaning,
    love, career, health, yes_or_no, as_a_person, feelings, advice,
    featured_image_url
  ) VALUES (
    'seven-of-swords',
    'Seven of Swords',
    'VII',
    'minor',
    ARRAY['strategy', 'cunning', 'avoidance', 'self-protection', 'secrets', 'taking what you need'],
    ARRAY['coming clean', 'guilt', 'self-sabotage', 'paranoia'],
    'The Seven of Swords is the tarot card of strategy, cunning, and sometimes avoidance. Upright, it can suggest you are protecting yourself by keeping plans or information private, or that you need to think ahead and act with discretion. It can also indicate taking something — an idea, an opportunity, or literal resources — and moving on before others catch up. Not always dishonest; often self-preservation.',
    'Reversed, the Seven of Swords can point to secrets surfacing, guilt, or self-sabotage. You may be avoiding something you need to face, or others may be suspicious of your motives. It can also suggest giving up a strategy that was not serving you and choosing honesty or openness instead.',
    'In love, the Seven of Swords upright can indicate discretion, keeping boundaries, or one partner holding back information. It may suggest a need for more honesty or the end of a dynamic built on avoidance. Reversed, it can mean secrets revealed or a decision to stop hiding and communicate openly.',
    'In career, this card can point to competitive tactics, confidential projects, or the need to protect your ideas. Reversed, it may suggest office politics backfiring, or the need to be transparent to avoid misunderstandings or loss of trust.',
    'In health readings, the Seven of Swords can relate to avoiding medical advice, hiding symptoms, or self-managing in isolation. Reversed, it encourages seeking proper care and being honest with yourself and practitioners.',
    'For yes or no: the Seven of Swords often suggests caution or a "not yet" — outcomes may depend on honesty and full disclosure.',
    'As a person, the Seven of Swords describes someone strategic, private, and sometimes evasive. They may be clever and resourceful but can struggle with trust or full transparency. At their best they are shrewd; at their worst they can be deceptive or self-sabotaging.',
    'When this card represents feelings, it suggests the person may be guarded, uncertain whether to trust you fully, or holding back their true thoughts. Reversed, they may be ready to open up or may feel guilty about past secrecy.',
    'The Seven of Swords advises you to weigh the cost of secrecy versus honesty. Protect yourself where necessary, but avoid strategies that will later undermine your peace or relationships. Sometimes the best move is to come clean and move forward with integrity.'
  , 'https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/BLOODBOUND-TAROT/seven-of-swords.jpg'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    number = EXCLUDED.number,
    arcana = EXCLUDED.arcana,
    upright_keywords = EXCLUDED.upright_keywords,
    reversed_keywords = EXCLUDED.reversed_keywords,
    upright_meaning = EXCLUDED.upright_meaning,
    reversed_meaning = EXCLUDED.reversed_meaning,
    love = EXCLUDED.love,
    career = EXCLUDED.career,
    health = EXCLUDED.health,
    yes_or_no = EXCLUDED.yes_or_no,
    as_a_person = EXCLUDED.as_a_person,
    feelings = EXCLUDED.feelings,
    advice = EXCLUDED.advice,
    featured_image_url = EXCLUDED.featured_image_url,
    updated_at = now();

  -- Two of Swords (Minor Arcana)
  INSERT INTO card_meanings (
    slug, name, number, arcana,
    upright_keywords, reversed_keywords,
    upright_meaning, reversed_meaning,
    love, career, health, yes_or_no, as_a_person, feelings, advice,
    featured_image_url
  ) VALUES (
    'two-of-swords',
    'Two of Swords',
    'II',
    'minor',
    ARRAY['indecision', 'stalemate', 'weighing options', 'blocked emotions', 'truce'],
    ARRAY['decision made', 'unblocking', 'information revealed', 'indecision lifting'],
    'The Two of Swords is the tarot card of indecision and stalemate. Upright, it shows a figure blindfolded, holding two swords in balance — unable or unwilling to see clearly and choose. You may be weighing two options that seem equally valid, or avoiding a decision out of fear of the outcome. The card suggests a temporary truce or deadlock that cannot hold forever. Clarity will come when you allow yourself to look at what you have been avoiding.',
    'Reversed, the Two of Swords can indicate that the deadlock is breaking: a decision is being made, information is coming to light, or you are finally ready to choose. It can also mean continued indecision causing stress, or the need to remove the blindfold and face the truth before it forces your hand.',
    'In love, the Two of Swords upright often describes a relationship at a standstill — neither partner moving forward, or one person unable to choose between two paths. Communication may be blocked. Reversed, it can suggest a decision about the relationship being made or the start of honest conversation.',
    'In career, this card can point to being stuck between two job offers, strategies, or loyalties. Reversed, it may indicate movement after a period of hesitation, or the need to make a call and commit.',
    'In health, the Two of Swords can relate to postponing a medical decision or feeling torn between treatment options. Reversed, it encourages seeking the information you need and making a clear choice with professional support.',
    'For yes or no: the Two of Swords usually suggests that the answer is unclear until a decision is made or more information is gathered — often a "wait" or "decide first."',
    'As a person, the Two of Swords represents someone who struggles with decisions, prefers to stay neutral, or is emotionally blocked. They can be thoughtful but may frustrate others with their inability to commit. Reversed, they may be finally taking a stand.',
    'When this card represents feelings, it suggests the person is uncertain about their emotions or their commitment to you. They may be weighing you against someone or something else. Reversed, they may be moving toward clarity or confession.',
    'The Two of Swords advises you to gather the information you need and then choose. The blindfold serves no one forever. Making a decision, even an imperfect one, is often better than remaining stuck in indecision.'
  , 'https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/BLOODBOUND-TAROT/two-of-swords.jpg'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    number = EXCLUDED.number,
    arcana = EXCLUDED.arcana,
    upright_keywords = EXCLUDED.upright_keywords,
    reversed_keywords = EXCLUDED.reversed_keywords,
    upright_meaning = EXCLUDED.upright_meaning,
    reversed_meaning = EXCLUDED.reversed_meaning,
    love = EXCLUDED.love,
    career = EXCLUDED.career,
    health = EXCLUDED.health,
    yes_or_no = EXCLUDED.yes_or_no,
    as_a_person = EXCLUDED.as_a_person,
    feelings = EXCLUDED.feelings,
    advice = EXCLUDED.advice,
    featured_image_url = EXCLUDED.featured_image_url,
    updated_at = now();

  -- The High Priestess (Major Arcana II) — slug: high-priestess
  INSERT INTO card_meanings (
    slug, name, number, arcana,
    upright_keywords, reversed_keywords,
    upright_meaning, reversed_meaning,
    love, career, health, yes_or_no, as_a_person, feelings, advice,
    featured_image_url
  ) VALUES (
    'high-priestess',
    'The High Priestess',
    'II',
    'major',
    ARRAY['intuition', 'mystery', 'hidden knowledge', 'inner voice', 'receptivity', 'the unconscious'],
    ARRAY['secrets revealed', 'overthinking', 'ignoring intuition', 'surface-level understanding'],
    'The High Priestess is the tarot card of intuition, mystery, and the wisdom that lies beneath the surface. Upright, she represents the inner voice, dreams, and the power of not yet acting — of waiting, listening, and allowing hidden knowledge to emerge. She sits between the pillars of conscious and unconscious, inviting you to trust what you sense rather than only what you can prove. This is a card of receptivity, sacred knowledge, and the strength of silence.',
    'Reversed, the High Priestess can indicate that you are ignoring your intuition, overthinking, or that secrets are coming to light. You may be too focused on the surface and missing deeper messages. It can also suggest a need to reconnect with your inner wisdom or to honour the parts of yourself that you have kept hidden.',
    'In love, the High Priestess upright suggests a connection that has a fated or soul-level quality, or a time when words are less important than presence and intuition. It can indicate unspoken feelings or the need to listen to your gut about a partner. Reversed, it may point to hidden agendas, confusion, or the need to trust your instincts about the relationship.',
    'In career, this card can point to work that involves research, psychology, the arts, or anything that draws on the unseen. It may suggest waiting before making a big move or paying attention to signs and hunches. Reversed, it can indicate missing important cues or acting without enough reflection.',
    'In health, the High Priestess can relate to listening to your body, exploring holistic or intuitive approaches, or the link between emotional and physical wellbeing. Reversed, it may suggest ignoring body signals or the need to seek deeper answers than surface symptoms.',
    'For yes or no: the High Priestess often suggests that the answer is not in the logical realm yet — listen to your intuition, or wait for more to be revealed. It can lean toward yes when you trust your inner knowing.',
    'As a person, the High Priestess represents someone intuitive, private, and wise. They may work in healing, the arts, or spiritual practice. They can seem mysterious or hard to read because they do not share everything. At their best they are deeply perceptive; at their worst they can be secretive or withdrawn.',
    'When this card represents feelings, it suggests the person has deep, perhaps unspoken feelings for you. They may be waiting for the right moment or listening to their intuition about the relationship. Reversed, they may be confused about their feelings or hiding something.',
    'The High Priestess advises you to slow down and listen. Not every answer lives in the rational mind. Trust your dreams, your gut, and the quiet voice within. Some things are meant to unfold in their own time.'
  , 'https://iwhejzjkdqkmkzzhibtv.supabase.co/storage/v1/object/public/template-previews/BLOODBOUND-TAROT/high-priestess.jpg'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    number = EXCLUDED.number,
    arcana = EXCLUDED.arcana,
    upright_keywords = EXCLUDED.upright_keywords,
    reversed_keywords = EXCLUDED.reversed_keywords,
    upright_meaning = EXCLUDED.upright_meaning,
    reversed_meaning = EXCLUDED.reversed_meaning,
    love = EXCLUDED.love,
    career = EXCLUDED.career,
    health = EXCLUDED.health,
    yes_or_no = EXCLUDED.yes_or_no,
    as_a_person = EXCLUDED.as_a_person,
    feelings = EXCLUDED.feelings,
    advice = EXCLUDED.advice,
    featured_image_url = EXCLUDED.featured_image_url,
    updated_at = now();

END;
$$;
