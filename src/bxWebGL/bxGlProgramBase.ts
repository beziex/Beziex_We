import { BxGlProgramObject } from './bxGlProgContainer';

export class BxGlProgramBase extends BxGlProgramObject {

    private gl_:            WebGLRenderingContext;
    private shaderProgram_: WebGLProgram|null;

    private readonly vertexShaderCode_: string|null;
    private readonly fragmentShaderCode_: string|null;

    // -------------------------------------------------------
    
    protected getShaderCode(): { vertexShaderCode: string|null, fragmentShaderCode: string|null }
    {
        const vertexShaderCode: string|null   = this.vertexShaderCode_;
        const fragmentShaderCode: string|null = this.fragmentShaderCode_;

        return { vertexShaderCode, fragmentShaderCode };
    }

    public constructor(gl: WebGLRenderingContext, vertexShaderCode: string, fragmentShaderCode: string) {
        super();

        this.gl_            = gl;
        this.shaderProgram_ = 0;

        this.vertexShaderCode_   = vertexShaderCode;
        this.fragmentShaderCode_ = fragmentShaderCode;

        this.createShaderProgram();
    }

    public releaseShaderProgram(): void {
        if (this.shaderProgram_) {
            this.gl_.deleteProgram(this.shaderProgram_);
            this.shaderProgram_ = 0;
        }
    }

    public shaderProgram(): WebGLProgram|null {
        return this.shaderProgram_;
    }

    // -------------------------------------------------------

    private createShaderProgram(): void {
        const {vertexShaderCode, fragmentShaderCode} = this.getShaderCode();

        if (vertexShaderCode && fragmentShaderCode) {
            const vertexShader   = this.createVertexShader(vertexShaderCode);
            const fragmentShader = this.createFragmentShader(fragmentShaderCode);

            this.shaderProgram_ = this.gl_.createProgram();
            if (vertexShader && fragmentShader && this.shaderProgram_) {
                this.gl_.attachShader(this.shaderProgram_, vertexShader);
                this.gl_.attachShader(this.shaderProgram_, fragmentShader);

                this.gl_.deleteShader(vertexShader);
                this.gl_.deleteShader(fragmentShader);

                this.gl_.linkProgram(this.shaderProgram_);

                const info = this.gl_.getProgramInfoLog(this.shaderProgram_);
                if (info != null && info != "") alert("info != null && info != \"\"");
            }
        }
    }

    private createVertexShader(vertexShaderCode: string): WebGLShader|null {
        const vertexShader = this.gl_.createShader(this.gl_.VERTEX_SHADER);
        if (!vertexShader)
            return null;

        try {
            this.gl_.shaderSource(vertexShader, vertexShaderCode);
        }
        catch( Exception ) {
            alert("false");
        }

        this.gl_.compileShader(vertexShader);

        let  status: boolean;
        try {
            status = this.gl_.getShaderParameter(vertexShader, this.gl_.COMPILE_STATUS);
            if (status == false) {
                const msg = "createVertexShader: " + this.gl_.getShaderInfoLog(vertexShader);
                alert(msg);
            }
        }
        catch( Exception ) {
            alert("false");
        }

        return vertexShader;
    }

    private createFragmentShader(fragmentShaderCode: string): WebGLShader|null {
        const fragmentShader = this.gl_.createShader(this.gl_.FRAGMENT_SHADER);
        if (!fragmentShader)
            return null;

        try {
            this.gl_.shaderSource(fragmentShader, fragmentShaderCode);
        }
        catch( Exception ) {
            alert("false");
        }

        this.gl_.compileShader(fragmentShader);

        let  status: boolean;
        try {
            status = this.gl_.getShaderParameter(fragmentShader, this.gl_.COMPILE_STATUS);
            if (status == false) {
                const msg = "createFragmentShader: " + this.gl_.getShaderInfoLog(fragmentShader);
                alert(msg);
            }
        }
        catch( Exception ) {
            alert("false");
        }

        return fragmentShader;
    }
}
