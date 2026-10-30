/*
 * Duotone and wireframe filters for the Selected work thumbnails, rendered once in the root layout.
 * Panel renders its children once per layer, so defining these inside SelectedWork would duplicate the ids.
 *
 * Both map luminance onto the same two site colors: ground #0f131a (a shade under --po-surface) and
 * ink #8ccbd9 (a muted --accent-2). "light" thumbs (white app UI) flip so white becomes ground, which reads
 * like a dark-mode blueprint. "dark" thumbs (already dark UI) keep their polarity. Tone comes from the
 * image build (scripts/build-work-images.mjs). SVG table values cannot read CSS variables, hence the literals.
 *
 * The sketch layer draws the same thumb as a wireframe: an edge detect that keeps only outlines, in the
 * sketch line color (--sk-line #1f2937), on a transparent ground so the grid paper shows through.
 */
const GROUND = [0.059, 0.075, 0.102];
const INK = [0.549, 0.796, 0.851];
const SKETCH_LINE = [0.122, 0.161, 0.216];

const LUMINANCE = "0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0";

function Duotone({ id, dark, light }: { id: string; dark: number[]; light: number[] }) {
  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values={LUMINANCE} />
      <feComponentTransfer>
        <feFuncR type="table" tableValues={`${dark[0]} ${light[0]}`} />
        <feFuncG type="table" tableValues={`${dark[1]} ${light[1]}`} />
        <feFuncB type="table" tableValues={`${dark[2]} ${light[2]}`} />
      </feComponentTransfer>
    </filter>
  );
}

/*
 * Edges from a 4-neighbour Laplacian. Its negative parts clip to zero, so it runs twice with opposite signs and
 * the two are summed to catch both sides of each edge. Edge strength becomes alpha; GAIN and CUT trade line
 * weight against speckle from small text.
 */
const LAPLACIAN = "0 -1 0 -1 4 -1 0 -1 0";
const LAPLACIAN_NEG = "0 1 0 1 -4 1 0 1 0";
const GAIN = 2.2;
const CUT = 0.12;

function Wireframe({ id }: { id: string }) {
  const [r, g, b] = SKETCH_LINE;
  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values={LUMINANCE} result="gray" />
      <feConvolveMatrix in="gray" order="3" kernelMatrix={LAPLACIAN} preserveAlpha="true" result="rise" />
      <feConvolveMatrix in="gray" order="3" kernelMatrix={LAPLACIAN_NEG} preserveAlpha="true" result="fall" />
      <feComposite in="rise" in2="fall" operator="arithmetic" k2={1} k3={1} />
      <feColorMatrix type="matrix" values={`0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} ${GAIN} 0 0 0 ${-CUT}`} />
    </filter>
  );
}

export function WorkThumbFilters() {
  return (
    // Absolute so the zero-size svg never opens a line box above the page.
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <Duotone id="work-thumb-tint-light" dark={INK} light={GROUND} />
      <Duotone id="work-thumb-tint-dark" dark={GROUND} light={INK} />
      <Wireframe id="work-thumb-wire" />
    </svg>
  );
}
