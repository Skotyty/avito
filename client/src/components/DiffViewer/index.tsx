import { Box, Typography, Chip, Paper } from '@mui/material';

interface DiffViewerProps {
  original: string;
  improved: string;
}

interface DiffSegment {
  type: 'equal' | 'added' | 'removed';
  text: string;
}

function computeDiff(original: string, improved: string): {
  original: DiffSegment[];
  improved: DiffSegment[];
} {
  const origWords = original.split(/(\s+)/);
  const impWords = improved.split(/(\s+)/);
  const m = origWords.length;
  const n = impWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        origWords[i - 1] === impWords[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const ops: Array<{ type: 'equal' | 'added' | 'removed'; orig?: string; imp?: string }> = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origWords[i - 1] === impWords[j - 1]) {
      ops.unshift({ type: 'equal', orig: origWords[i - 1], imp: impWords[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.unshift({ type: 'added', imp: impWords[j - 1] });
      j--;
    } else {
      ops.unshift({ type: 'removed', orig: origWords[i - 1] });
      i--;
    }
  }

  const origSegs: DiffSegment[] = [];
  const impSegs: DiffSegment[] = [];

  for (const op of ops) {
    if (op.type === 'equal') {
      origSegs.push({ type: 'equal', text: op.orig! });
      impSegs.push({ type: 'equal', text: op.imp! });
    } else if (op.type === 'removed') {
      origSegs.push({ type: 'removed', text: op.orig! });
    } else {
      impSegs.push({ type: 'added', text: op.imp! });
    }
  }

  return { original: origSegs, improved: impSegs };
}

function renderSegments(segments: DiffSegment[]) {
  return segments.map((seg, idx) => {
    if (seg.type === 'equal') return <span key={idx}>{seg.text}</span>;
    if (seg.type === 'removed') {
      return (
        <mark
          key={idx}
          style={{
            background: '#FFEBEE',
            color: '#C62828',
            textDecoration: 'line-through',
            borderRadius: 2,
            padding: '0 2px',
          }}
        >
          {seg.text}
        </mark>
      );
    }
    return (
      <mark
        key={idx}
        style={{ background: '#E8F5E9', color: '#2E7D32', borderRadius: 2, padding: '0 2px' }}
      >
        {seg.text}
      </mark>
    );
  });
}

export function DiffViewer({ original, improved }: DiffViewerProps) {
  const { original: origSegs, improved: impSegs } = computeDiff(original, improved);

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {[
        { label: 'Было', color: 'error' as const, segs: origSegs },
        { label: 'Стало', color: 'success' as const, segs: impSegs },
      ].map(({ label, color, segs }) => (
        <Box key={label} sx={{ flex: 1 }}>
          <Chip label={label} color={color} size="small" sx={{ mb: 1 }} />
          <Paper
            variant="outlined"
            sx={{ p: 1.5, minHeight: 80, borderRadius: 1 }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
              {renderSegments(segs)}
            </Typography>
          </Paper>
        </Box>
      ))}
    </Box>
  );
}
