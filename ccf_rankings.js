const ccfRankingsDB = [
    { acronym: "SIGCOMM", rank: "A" },
    { acronym: "MOBICOM", rank: "A" },
    { acronym: "INFOCOM", rank: "A" },
    { acronym: "NSDI", rank: "A" },
    { acronym: "SENSYS", rank: "B" },
    { acronym: "CONEXT", rank: "B" },
    { acronym: "SECON", rank: "B" },
    { acronym: "IPSN", rank: "B" },
    { acronym: "MOBISYS", rank: "B" },
    { acronym: "ICNP", rank: "B" },
    { acronym: "MOBIHOc", rank: "B" },
    { acronym: "NOSSDAV", rank: "B" },
    { acronym: "WSN", rank: "B" },
    { acronym: "MASS", rank: "C" },
    { acronym: "GLOBECOM", rank: "C" },
    { acronym: "ICC", rank: "C" },
    { acronym: "ICCCN", rank: "C" },
    { acronym: "WCNC", rank: "C" },
    { acronym: "ISCC", rank: "C" },
    { acronym: "PIMRC", rank: "C" },
    { acronym: "CVPR", rank: "A" },
    { acronym: "ICCV", rank: "A" },
    { acronym: "ECCV", rank: "B" },
    { acronym: "ICML", rank: "A" },
    { acronym: "NEURIPS", rank: "A" },
    { acronym: "KDD", rank: "A" },
    { acronym: "SIGIR", rank: "A" },
    { acronym: "WWW", rank: "A" },
    { acronym: "VLDB", rank: "A" },
    { acronym: "ICDE", rank: "A" },
    { acronym: "SIGMOD", rank: "A" },
    { acronym: "AAAI", rank: "A" },
    { acronym: "IJCAI", rank: "A" },
    { acronym: "ACL", rank: "A" },
    { acronym: "EMNLP", rank: "B" },
    { acronym: "NAACL", rank: "B" },
    { acronym: "CHI", rank: "A" },
    { acronym: "UbiComp", rank: "A" }
];

function lookupCCFConference(name) {
    if (!name) return null;
    const lowerName = name.toLowerCase();
    for (const entry of ccfRankingsDB) {
        if (lowerName.includes(entry.acronym.toLowerCase())) {
            return entry;
        }
    }
    return null;
}
