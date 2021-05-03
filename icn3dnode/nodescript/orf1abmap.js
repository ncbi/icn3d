
function ORF1abMap(accession, offset, seqLen) {
    for(var i = 1; i <= seqLen; ++i) {
        var resiFrom = offset + i;
        console.log(resiFrom + '|' + accession + '|' + i);
    }
}

ORF1abMap('YP_009725297', 0, 180);
ORF1abMap('YP_009725298', 180, 638);
ORF1abMap('YP_009725299', 818, 1945);
ORF1abMap('YP_009725300', 2763, 500);
ORF1abMap('YP_009725301', 3263, 306);
ORF1abMap('YP_009725302', 3569, 290);
ORF1abMap('YP_009725303', 3859, 83);
ORF1abMap('YP_009725304', 3942, 198);
ORF1abMap('YP_009725305', 4140, 113);
ORF1abMap('YP_009725306', 4253, 139);
ORF1abMap('YP_009725307', 4392, 932);
ORF1abMap('YP_009725308', 5324, 601);
ORF1abMap('YP_009725309', 5925, 527);
ORF1abMap('YP_009725310', 6452, 346);
ORF1abMap('YP_009725311', 6798, 298);
