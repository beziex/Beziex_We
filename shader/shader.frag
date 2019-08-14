precision highp float;

varying vec3  fragFrontColor;
varying vec3  fragBackColor;


void main()
{
    if( gl_FrontFacing )
        gl_FragColor = vec4( fragFrontColor, 1.0 );
    else
        gl_FragColor = vec4( fragBackColor,  1.0 );
}
