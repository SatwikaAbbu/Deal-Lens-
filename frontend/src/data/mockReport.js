export const mockReport = {
    "report_id": "91494e91-1b4f-48a3-b582-54135b044a22",
    "file_name": "Pitch-Example-Air-BnB-PDF.pdf",
    "scorecard": {
        "startup_name": "AirBed&Breakfast",
        "overall": 2.6,
        "dimensions": {
            "founder_credibility": 1.0,
            "market_validity": 3.0,
            "competitive_moat": 2.0,
            "traction_quality": 1.0,
            "financial_soundness": 6.0
        },
        "top_flags": [
            "No founder details provided, making credibility assessment impossible.",
            "Market size claims are unsubstantiated and use non-standard metrics.",
            "Complete lack of reported traction data or existing metrics."
        ],
        "strengths": [
            "Clear and logical commission-based business model.",
            "Emphasis on host incentives and user experience (ease of use, design, profiles)."
        ]
    },
    "founder": {
        "domain_fit": "LOW",
        "flags": [
            "No founder details provided in pitch deck."
        ],
        "explanation": "Cannot assess domain fit without founder names or background information.",
        "investor_question": "Can you walk me through the founding team's specific prior experience in this exact industry?"
    },
    "claims": {
        "tam": {
            "verdict": "UNSUBSTANTIATED",
            "claimed_tam": "1.9 Billion+ TRIPS BOOKED (WORDLWIDE)",
            "real_tam": "No comparable data for 'trips booked' found in web research.",
            "inflation_factor": null,
            "explanation": "The founder claims a Total Available Market of 1.9 Billion+ trips booked worldwide. However, the provided web research details the travel accommodation market's monetary value, not the total number of trips booked, making a direct comparison impossible.",
            "source": "https://www.einpresswire.com/article/841787757/travel-accommodation-market-size-demand-analytical-overview-comprehensive-analysis-to-forecast-2025-2032",
            "investor_question": "Can you provide a source for the 1.9 Billion+ trips booked worldwide, and clarify how this translates into a monetary market size?"
        },
        "traction": {
            "flags": []
        },
        "moat": {
            "verdict": "WEAK",
            "competitors": [
                "Booking.com",
                "VRBO",
                "Fairbnb",
                "Vacasa",
                "Whimstay",
                "Expedia",
                "Agoda"
            ],
            "explanation": "The claim of being '1st TO MARKET' is directly contradicted by the existence of numerous established competitors like Booking.com, VRBO, and Fairbnb, which offer similar short-term rental services. This indicates a crowded market where a first-mover advantage is not present.",
            "investor_question": "Given the highly competitive landscape with many established players, how will your 'HOST INCENTIVE' and 'LIST ONCE' features truly differentiate you and attract significant market share from these incumbents?"
        },
        "financials": {
            "flags": []
        }
    },
    "competitors": [
        "Booking.com",
        "VRBO",
        "Fairbnb",
        "Vacasa",
        "Whimstay",
        "Expedia",
        "Agoda"
    ],
    "questions": [
        {
            "rank": 1,
            "category": "Founder",
            "severity": "HIGH",
            "question": "The deck doesn't include any details about the founding team. Can you walk me through your collective experience, particularly any direct experience in the travel or hospitality industry, and explain why you are the right team to execute on this ambitious vision?",
            "targets_claim": "No founder details provided in pitch deck.",
            "gap_found": "Lack of information on the founding team makes it impossible to assess domain fit, experience, or ability to execute.",
            "strong_answer_looks_like": "Clear roles, relevant industry experience, past successes, and a compelling reason for this specific team to build this product."
        },
        {
            "rank": 2,
            "category": "Moat",
            "severity": "HIGH",
            "question": "Your deck claims AirBed&Breakfast is '1st TO MARKET'. However, established players like Booking.com and VRBO have been operating in similar spaces for years. Can you elaborate on how you define '1st TO MARKET' in this context, and what specific, defensible advantage you believe you truly possess over these incumbents?",
            "targets_claim": "1st TO MARKET",
            "gap_found": "The claim of being '1st TO MARKET' is directly contradicted by the existence of numerous established competitors offering similar services.",
            "strong_answer_looks_like": "A very specific niche, a truly novel approach not offered by others, or a clear strategy to out-compete on a specific dimension that is hard to replicate."
        },
        {
            "rank": 3,
            "category": "Finance",
            "severity": "HIGH",
            "question": "Your financial projections show 'REVENUE 2008-2011 $200M'. Given that the deck doesn't present any current traction metrics or a detailed breakdown of how you plan to scale to this level so rapidly, can you walk me through the key assumptions and milestones that underpin this aggressive $200M revenue projection?",
            "targets_claim": "REVENUE 2008-2011 $200M",
            "gap_found": "The revenue projection is extremely aggressive for a startup with no mentioned traction, and the deck lacks a clear path or current metrics to support such a high figure.",
            "strong_answer_looks_like": "Detailed unit economics, clear customer acquisition strategy, proven conversion rates (even if small scale), and a realistic timeline with supporting data."
        },
        {
            "rank": 4,
            "category": "Market",
            "severity": "MEDIUM",
            "question": "You've stated a Total Available Market of '1.9 Billion+ TRIPS BOOKED (WORLDWIDE)'. Can you provide the source for this specific number of trips, and help me understand how you've translated this into a monetary market size that aligns with typical investment metrics?",
            "targets_claim": "1.9 Billion+ TRIPS BOOKED (WORDLWIDE) Total Available Market",
            "gap_found": "The claimed TAM is unsubstantiated, and the analysis found no comparable data for 'trips booked' to verify this figure or translate it into a monetary market size.",
            "strong_answer_looks_like": "A credible, verifiable source for the trips data, and a clear methodology for converting trips into a revenue opportunity for their specific business model."
        },
        {
            "rank": 5,
            "category": "Moat",
            "severity": "MEDIUM",
            "question": "Your deck highlights 'HOST INCENTIVE' and 'LIST ONCE' as key advantages. In a market with many established players, how do these specific features create a truly defensible moat that will prevent competitors from easily replicating them or offering superior alternatives, especially considering the existing options for hosts?",
            "targets_claim": "HOST INCENTIVE, LIST ONCE",
            "gap_found": "While these are features, the analysis indicates a crowded market where these might not be unique or strong enough to create a defensible moat against established competitors.",
            "strong_answer_looks_like": "A detailed explanation of why their specific implementation of these features is superior, proprietary, or creates network effects that are difficult for competitors to replicate."
        }
    ]
};
