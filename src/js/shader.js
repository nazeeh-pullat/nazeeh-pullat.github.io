// Tiny liquid-gradient fragment shader (no libraries). Renders at half resolution and pauses when off-screen.
export function initShader(canvas) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;
  const fs = `precision mediump float;uniform vec2 r,m;uniform float t;
vec3 pal(float x){vec3 a=vec3(.969,.145,.522),b=vec3(.447,.035,.718),c=vec3(.227,.047,.639),d=vec3(.263,.380,.933),e=vec3(.298,.788,.941);x=clamp(x,0.,1.)*4.;
if(x<1.)return mix(a,b,x);if(x<2.)return mix(b,c,x-1.);if(x<3.)return mix(c,d,x-2.);return mix(d,e,x-3.);}
void main(){vec2 uv=gl_FragCoord.xy/r;uv.x*=r.x/r.y;vec2 mm=m/r;mm.x*=r.x/r.y;float d=distance(uv,mm);vec2 q=uv*1.6;
for(float i=1.;i<4.;i++){q+=vec2(sin(q.y*1.7+t*.35*i)*.35,cos(q.x*1.5-t*.3*i)*.35)/i;}
q+=(uv-mm)*.35*exp(-d*3.);float v=.5+.5*sin(q.x*2.2+q.y*1.8+t*.25);v=smoothstep(0.,1.,v+(.25-d)*.25);gl_FragColor=vec4(pal(v),1.);}`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pg = gl.createProgram();
  gl.attachShader(pg, sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
  gl.attachShader(pg, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(pg); gl.useProgram(pg);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const a = gl.getAttribLocation(pg, 'p'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(pg, n), ur = U('r'), um = U('m'), ut = U('t'), Q = 0.5;
  let W, H;
  const size = () => { W = canvas.width = Math.max(2, (canvas.clientWidth * Q) | 0); H = canvas.height = Math.max(2, (canvas.clientHeight * Q) | 0); gl.viewport(0, 0, W, H); };
  size(); addEventListener('resize', size);
  let mx = W * 0.6, my = H * 0.5, tx = mx, ty = my, on = true;
  addEventListener('pointermove', (e) => { const b = canvas.getBoundingClientRect(); tx = (e.clientX - b.left) * Q; ty = (b.bottom - e.clientY) * Q; });
  new IntersectionObserver((e) => { on = e[0].isIntersecting; }).observe(canvas);
  const t0 = performance.now();
  (function frame() {
    requestAnimationFrame(frame);
    if (!on || document.hidden) return;
    mx += (tx - mx) * 0.08; my += (ty - my) * 0.08;
    gl.uniform2f(ur, W, H); gl.uniform2f(um, mx, my); gl.uniform1f(ut, (performance.now() - t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  })();
}
