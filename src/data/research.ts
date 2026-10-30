import type { Paper, ResearchProject } from './types';

/**
 * Published papers. Each entry gets an abstract toggle, publisher / DOI / PDF links,
 * a Copy BibTeX button, a deep link (#/research/<id>) and is available to `research` / `open <id>`.
 */
export const papers: Paper[] = [
  {
    id: 'cltl-medical-hindi',
    title:
      'Cross-Lingual Transfer Learning for Medical NER and Question Answering in Low-Resource Language (Hindi)',
    authors: [
      'Dhruv Kothari',
      'Harshit Soni',
      'Smit Shah',
      'Anmol Bajaj',
      'Prachi Tawde',
      'Vinaya Sawant',
    ],
    venue:
      '2026 International Conference on Multidisciplinary Innovations for Smart & Sustainable Future (MISSF), Dhule, India',
    year: 2026,
    pages: '1-6',
    abstract:
      'Biomedical natural language processing has made substantial progress in recent years, but research still focuses mostly on high-resource languages while low-resource languages such as Hindi remain unaddressed. This study introduces a cross-lingual transfer learning framework that combines two essential medical NLP tasks in Hindi: named entity recognition and question answering. English biomedical corpora are used together with XLM-RoBERTa, IndicTrans2 translation and embedding-aligned label projection to produce disambiguated Hindi semantic representations for NER, supported by a specialised Hindi medical lexicon that separates entity types through embedding similarity search. The NER model achieves an F1-score of 84.79% on the Hindi test set. For question answering, the BLOOM language model is fine-tuned with LoRA on the English MedQuAD dataset and then on its Hindi version, and a Retrieval-Augmented Generation (RAG) step supplies multilingual medical evidence to reduce factual errors. Evaluated on 1,000 Hindi medical question-answer pairs, the system reaches a BERTScore F1 of 0.6958 with no critical safety problems, offering a scalable path to trustworthy healthcare information in low-resource languages.',
    doi: '10.1109/MISSF68264.2026.11522220',
    url: 'https://ieeexplore.ieee.org/abstract/document/11522220',
    image: 'research/cltl-ieee.png',
    imageAlt:
      'IEEE Xplore page for "Cross-Lingual Transfer Learning for Medical NER and Question Answering in Low-Resource Language (Hindi)" by Dhruv Kothari, Harshit Soni, Smit Shah, Anmol Bajaj, Prachi Tawde and Vinaya Sawant.',
    bibtex: `@inproceedings{kothari2026crosslingual,
  title     = {Cross-Lingual Transfer Learning for Medical {NER} and Question Answering in Low-Resource Language ({Hindi})},
  author    = {Kothari, Dhruv and Soni, Harshit and Shah, Smit and Bajaj, Anmol and Tawde, Prachi and Sawant, Vinaya},
  booktitle = {2026 International Conference on Multidisciplinary Innovations for Smart \\& Sustainable Future (MISSF)},
  pages     = {1--6},
  year      = {2026},
  publisher = {IEEE},
  doi       = {10.1109/MISSF68264.2026.11522220}
}`,
    tags: ['NLP', 'Cross-lingual', 'Healthcare', 'LLM'],
    status: 'Published · IEEE',
  },
  {
    id: 'isl-iccds25',
    title: 'Multi-Modal System for Translating Indian Sign Language and Facial Expressions into Text',
    authors: [
      'Aman Mehra',
      'Harshit Soni',
      'Jash Bhatt',
      'Poonam Jadhav',
      'Dhavit Gandhi',
      'Arjun K. Jaiswal',
    ],
    venue: '2025 2nd International Conference on Computing and Data Science (ICCDS), Chennai, India',
    year: 2025,
    pages: '1-6',
    abstract:
      'Indian Sign Language (ISL) is the primary communication mode for millions of Deaf and hard-of-hearing individuals in India, yet effective tools for its translation are still limited. This paper proposes a deep learning-based multimodal system for translating ISL into text, integrating both manual and non-manual features such as facial expressions. The system leverages transfer learning to improve recognition accuracy and efficiency, using pretrained models to reduce the need for large labeled datasets. By processing both manual signs and emotional cues, the approach enhances the contextual richness of ISL, providing a more accurate and expressive translation that can be applied across educational, professional and social contexts to bridge communication gaps and promote inclusivity for the Deaf community.',
    doi: '10.1109/ICCDS64403.2025.11209739',
    url: 'https://ieeexplore.ieee.org/abstract/document/11209739',
    image: 'research/isl-paper.png',
    imageAlt:
      'First page of "Multi-Modal System For Translating Indian Sign Language And Facial Expressions into Text", with the author list and abstract.',
    bibtex: `@inproceedings{mehra2025multimodal,
  title     = {Multi-Modal System for Translating {Indian} Sign Language and Facial Expressions into Text},
  author    = {Mehra, Aman and Soni, Harshit and Bhatt, Jash and Jadhav, Poonam and Gandhi, Dhavit and Jaiswal, Arjun K.},
  booktitle = {2025 2nd International Conference on Computing and Data Science (ICCDS)},
  pages     = {1--6},
  year      = {2025},
  publisher = {IEEE},
  doi       = {10.1109/ICCDS64403.2025.11209739}
}`,
    tags: ['Computer Vision', 'Accessibility', 'Multimodal', 'LLM'],
    status: 'Published · IEEE',
  },
  {
    id: 'av-deepfake-xai',
    title: 'An Explainable Cross-Modal Transformer Model for Real-World Audio–Visual Deepfake Detection',
    authors: [
      'Harsh Jain',
      'Dhruv Kothari',
      'Divya Shah',
      'Harshit Soni',
      'Neha Agarwal',
      'Harshal Dalvi',
    ],
    venue: 'Dwarkadas J. Sanghvi College of Engineering, Department of Information Technology',
    year: 2026,
    abstract:
      'This study introduces a lightweight framework for detecting manipulated audio-visual media. Instead of treating audio and video as separate signals or simply concatenating features, it performs cross-modal reasoning with transformer-based encoders and an attention-based fusion module that links facial movements to speech patterns and their timing. The framework identifies artifacts specific to each modality and detects both partial and complete forgeries. It is trained on standard benchmarks and evaluated on a high-quality dataset collected from social media, made of high-resolution, minimally compressed videos recorded under varied conditions, where it detects unseen real-world samples across multiple manipulation types with 89% accuracy. Alongside detection, it offers three levels of explanation: visual attribution, temporal importance with audio-energy alignment, and modality ablation.',
    image: 'research/deepfake-paper.png',
    imageAlt:
      'First page of "An Explainable Cross-Modal Transformer Model for Real-World Audio–Visual Deepfake Detection", with the author list and abstract.',
    bibtex: `@unpublished{jain2026explainable,
  title  = {An Explainable Cross-Modal Transformer Model for Real-World Audio--Visual Deepfake Detection},
  author = {Jain, Harsh and Kothari, Dhruv and Shah, Divya and Soni, Harshit and Agarwal, Neha and Dalvi, Harshal},
  note   = {Manuscript, Dwarkadas J. Sanghvi College of Engineering},
  year   = {2026}
}`,
    tags: ['Deepfake Detection', 'Multimodal', 'Explainable AI', 'Security'],
    status: 'Manuscript',
  },
];

/** Research projects: the engineering behind each paper, shown as cards in the lab section. */
export const researchProjects: ResearchProject[] = [
  {
    id: 'isl-translation',
    title: 'Emotion-Aware Indian Sign Language Translation',
    summary:
      'Translates ISL gestures plus the signer’s facial emotion into a natural English sentence, using a gesture model, an emotion model and GPT-4.',
    description:
      'Most sign-language tools only read the hands, but in ISL the face carries meaning too. This system runs two models on the same video: a ResNet-18 + LSTM network recognises 85 signs from the INCLUDE-50 dataset, and a VGG16 with spatial attention classifies the signer’s facial emotion into seven classes. Their outputs are fused into a 64-dimensional embedding and turned into a prompt, so GPT-4 returns a sentence with the right words and the right tone, for example "…in a cheerful tone" when happiness dominates.',
    highlights: [
      'Gesture recognition: ResNet-18 frame encoder + LSTM over 85 INCLUDE-50 signs, 98.4% test accuracy (F1 91.83%).',
      'Emotion recognition: VGG16 with a spatial attention module, trained in three stages on 16,800 balanced images from FER2013, KDEF and AffectNet; 72.89% test accuracy.',
      'Fusion and prompting: 7-dim emotion scores + 85-dim gesture logits → 64-dim fusion embedding → emotion-aware GPT-4 prompt.',
      'Optimized the pipeline for low-resource devices, cutting inference latency by 30%, and pilot-tested it with 10+ users.',
      'Published at IEEE ICCDS 2025.',
    ],
    tags: ['ML', 'Computer Vision', 'Accessibility'],
    tech: ['Python', 'PyTorch', 'TensorFlow', 'ResNet-18', 'LSTM', 'VGG16', 'OpenCV', 'GPT-4'],
    affiliation: 'DJ Sanghvi College of Engineering',
    paper: 'isl-iccds25',
    image: 'research/isl-architecture.png',
    imageAlt:
      'Architecture diagram: video frames feed a ResNet-18 + LSTM gesture subsystem and a VGG16 emotion subsystem; their 85-dim and 7-dim scores are concatenated into a fusion embedding, turned into a prompt and sent to GPT-4.',
    date: '2025-07',
    status: 'Published',
  },
  {
    id: 'hindi-medical-nlp',
    title: 'Hindi Medical NER & Question Answering',
    summary:
      'Cross-lingual transfer from English biomedical data to Hindi: entity recognition with XLM-RoBERTa and a LoRA-tuned BLOOM + RAG for medical Q&A.',
    description:
      'Medical NLP tools mostly exist for English. This project transfers that knowledge to Hindi. English biomedical corpora are translated with IndicTrans2 and their entity labels are projected onto the Hindi text through embedding alignment, then XLM-RoBERTa is trained for Hindi NER with help from a purpose-built Hindi medical lexicon. For question answering, BLOOM is fine-tuned with LoRA on English MedQuAD and then its Hindi version, and a retrieval-augmented generation step grounds each answer in retrieved multilingual medical evidence to cut factual errors.',
    highlights: [
      'Hindi medical NER F1-score of 84.79% via XLM-RoBERTa, IndicTrans2 translation and embedding-aligned label projection.',
      'Hindi medical lexicon with embedding similarity search to disambiguate entity types.',
      'BLOOM fine-tuned with LoRA (English MedQuAD, then Hindi MedQuAD) with RAG over multilingual medical evidence.',
      'BERTScore F1 of 0.6958 on 1,000 Hindi medical Q&A pairs with no critical safety issues.',
      'Published at IEEE MISSF 2026.',
    ],
    tags: ['ML', 'NLP', 'Healthcare'],
    tech: ['Python', 'PyTorch', 'Hugging Face', 'XLM-RoBERTa', 'IndicTrans2', 'BLOOM', 'LoRA', 'RAG'],
    affiliation: 'DJ Sanghvi College of Engineering',
    paper: 'cltl-medical-hindi',
    image: 'research/cltl-ieee.png',
    imageAlt:
      'IEEE Xplore page for "Cross-Lingual Transfer Learning for Medical NER and Question Answering in Low-Resource Language (Hindi)".',
    date: '2026-04',
    status: 'Published',
  },
  {
    id: 'av-deepfake-detection',
    title: 'Explainable Audio–Visual Deepfake Detection',
    summary:
      'Cross-modal transformer that checks whether a face and a voice really belong together, with saliency, frame-level and audio-energy explanations.',
    description:
      'Deepfakes now fake the voice as well as the face, and detectors that look at one stream miss mismatches between them. This model encodes video with a Swin Transformer and audio with Wav2Vec2, then fuses them with bidirectional cross-attention so it can catch lip–speech and expression–voice inconsistencies. It classifies a clip into four classes (real or fake audio × real or fake video) and explains every decision: which pixels, which frames, how audio energy lines up with mouth motion, and how much each modality mattered.',
    highlights: [
      '89% accuracy on an unseen, high-quality dataset collected from YouTube and Instagram; class-wise F1 from 0.87 to 0.93.',
      'Swin Transformer visual encoder + Wav2Vec2 audio encoder with bidirectional cross-attention fusion and temporal pooling.',
      'Loss = cross-entropy + supervised contrastive (NT-Xent) + a cross-modal synchrony loss aligning mouth motion with audio RMS energy.',
      'Two-stage training (warm-freeze, then conservative fine-tuning) on FaceForensics++ (C23) and FakeAVCeleb.',
      'Explainability: gradient saliency maps, decision-critical frames, audio RMS energy timeline and modality ablation.',
    ],
    tags: ['ML', 'Security', 'Explainable AI'],
    tech: ['Python', 'PyTorch', 'Swin Transformer', 'Wav2Vec2', 'Cross-attention', 'OpenCV'],
    affiliation: 'DJ Sanghvi College of Engineering',
    paper: 'av-deepfake-xai',
    image: 'research/deepfake-architecture.png',
    imageAlt:
      'Architecture diagram: video and audio pipelines feed a Swin Transformer and Wav2Vec2, fused through bidirectional cross-attention into a unified embedding, with a 4-class head and visual, audio and modality explainability.',
    date: '2026',
    status: 'Manuscript',
  },
];
