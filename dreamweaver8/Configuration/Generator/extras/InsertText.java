
import java.util.*;
import com.macromedia.generator.api.*;
import com.macromedia.generator.app.*;
import com.macromedia.generator.platform.*;
import java.lang.Math;
import java.lang.System;


/**
 * The InsertText object inserts some text, allowing you to specify
 * characteristics of the text that you wish to insert.  The characteristics
 * that you can change (and the parameter associated with it) are:
 *	name	type	description
 * 	----	----	-----------
 * 	text	String	the actual text to be inserted
 *	color	String	the color of the text
 *	bgcolor	String	the background color
 *	rollovercolor	String	the color the text should turn when the mouse is over it
 *	font	String	the name of the font to be used
 *	bold	bool
 *	italic	bool
 *	size	int	the font's size
 *	spacing	int	
 * 	linewidth int	how wide the line of text is (determines line wrapping), in twips
 * 	alignment int
 *	valign	int	the vertical alignment
 *	indent	int	how much the text is indented, in pixels
 *	leftmargin int	how large the left margin is, in pixels
 *	rightmargin int	how large the right margin is, in pixels
 *	leading	int	the amount of space between text points, in points(?)
 * 	url	String	the URL the text goes to on being clicked
 *	window	String	the target window for the URL
 *	rotation int	the amount of rotation (in degrees), measured clockwise
 *	shrinkwrap	bool	whether or not the movie should shrinkwrap around the text
 */


/*
 * To be able to click on text:
 * ---
 * Create button
 * set text as states of button
 * create action
 *   add a GetURL to the action, specifying the url & window
 * add action to button
 */


public class InsertText extends GenericCommand
{

	private Context	mContext;
	private Script	mParentScript	= null;
	private Script	mTemplateScript	= null;
	private FlashEnvironment mEnv	= null;

	private Text	mText		= null;
	private Matrix	mMatrix		= null;
	private int	mStartFrame;
	private int	mEndFrame;
	private int	mLayer;
	private Rect	mBounds		= null;

    private static final int VERT_FUDGE_FACTOR = 40;
    private static final int BORDER_FUDGE = 40;

	/*
	 * The default values for the various attributes of the text.
	 */ 
	private static final String	DEFAULT_COLOR		=	"black";
	private static final String	DEFAULT_BG_COLOR	=	"none";
	private static final String	DEFAULT_FONT		=	"foo";
	private static final boolean	DEFAULT_ITALIC		=	false;
	private static final boolean	DEFAULT_BOLD		=	false;
	private static final int	DEFAULT_SIZE		=	12;
	private static final int	DEFAULT_SPACING		=	-1;
	private static final int	DEFAULT_LINE_WIDTH	=	-1;
        private static final String	DEFAULT_ALIGNMENT	=	"left";
        private static final String	DEFAULT_VALIGN	=	"center";
	private static final int	DEFAULT_INDENT		=	-1;
	private static final int	DEFAULT_MARGIN_LEFT	=	-1;
	private static final int	DEFAULT_MARGIN_RIGHT	=	-1;
	private static final int	DEFAULT_LEADING		=	-1;
	private static final String	DEFAULT_URL		=	"n/a";
	private static final String	DEFAULT_WINDOW		=	"_self";
	private static final String	DEFAULT_ROLLOVER_COLOR	=	"none";
	private static final int	DEFAULT_ROTATION	=	0;

	/*
	 * The names of all the parameters that will be passed to the object.
	 */
	private static final String	PARAM_STRING		=	"text";
	private static final String	PARAM_COLOR		=	"color";
	private static final String	PARAM_BG_COLOR		=	"bgcolor";
	private static final String	PARAM_FONT		=	"font";
	private static final String	PARAM_BOLD		=	"bold";
	private static final String	PARAM_ITALIC		=	"italic";
	private static final String	PARAM_SIZE		=	"size";
	private static final String	PARAM_SPACING		=	"spacing";
	private static final String	PARAM_LINE_WIDTH	=	"linewidth";
	private static final String	PARAM_ALIGNMENT		=	"alignment";
	private static final String	PARAM_VALIGN		=	"valign";
	private static final String	PARAM_INDENT		=	"indent";
	private static final String	PARAM_MARGIN_LEFT	=	"leftmargin";
	private static final String	PARAM_MARGIN_RIGHT	=	"rightmargin";
	private static final String	PARAM_LEADING		=	"leading";
	private static final String	PARAM_WINDOW		=	"window";
	private static final String	PARAM_ROTATION		=	"rotation";
	private static final String	PARAM_URL		=	"url";
	private static final String	PARAM_ROLLOVER_COLOR	=	"rollovercolor";
	private static final String	PARAM_SHRINKWRAP	=	"shrinkwrap";

	private static final String	PARAM_OFFSET		=	"offset";

	/*
	 * Variables storing the values of the attributes of the text.
	 */ 
	private String	mString;
	private Color	mColor;
	private Color	mBGColor;
	private Color	mRolloverColor;
	private Font	mFont;
	private boolean	mItalic;
	private boolean	mBold;
	private String	mWindow;
	private String	mUrl;
	private int	mSize;
	private int	mSpacing;
	private int	mLineWidth;
	private int	mAlignment;
	private int	mVAlign;
	private int	mIndent;
	private int	mMarginLeft;
	private int	mMarginRight;
	private int	mLeading;
	private int	mRotation;
	private boolean	mShrinkwrap = false;
	private int	mAlpha;

	private int	mOffset;	

	// debugging parameters
	private boolean mDrawBox = false;
	private boolean mDrawNums = false;

	public void doCommand(	FlashEnvironment env, Script script,
				Context context, int cmdIndex,
				Properties props) 
	{
		// save the parameters into instance Variables
		mEnv = env;
		mContext = context;
		mParentScript = script;
		mTemplateScript = script.getCommandScript(cmdIndex);

 		Shape background = null;

		// get the starting and ending frames
		mStartFrame = mParentScript.getCommandFrameIndex(cmdIndex);
		mEndFrame = mStartFrame + mParentScript.getCommandFrameCount(cmdIndex);

		// get the layer where this object exists
		mLayer = mParentScript.getCommandLayer(cmdIndex);

		try
		{
			// parse all the arguments passed in
			parseArguments(mEnv, mContext, props);

			// if we're going to shrinkwrap, we should insert into the top-level script
			if (mShrinkwrap)
			{
				mTemplateScript = mEnv.getTemplate();
			}

			// create the text object, with the parameters parsed in above
			mText = createText(mColor);

			// Create a default matrix for the text
			mMatrix = new Matrix();

			// Set the angle of rotation for the text.
			mMatrix.setAngle(mRotation);

			// determine the bounding box of the text
			mBounds = mText.getBounds();
			
			// add the margin fudge factor
			if (mMarginLeft > 0 || mMarginRight > 0)
			{
				int fudge = 0;
				if (mMarginLeft > 0) fudge += mMarginLeft;
				if (mMarginRight > 0) fudge += mMarginRight;

				mBounds.setXMax(mBounds.getXMax() + fudge);

			}

			// add some fudge on the bottom too
			mBounds.setYMax(mBounds.getYMax() + VERT_FUDGE_FACTOR);

			// if there's a background color, add that first
			if (mBGColor != null)
			{
				mTemplateScript.insertBackgroundColor(mBGColor);
			}
			
			// if we're not shrinkwrapping this movie, align the text into it's template rect
			if( !mShrinkwrap && mBounds != null)
			{
				Rect containerBounds = mParentScript.getCommandRect(cmdIndex);
				
				//mEnv.logError( "ymin: " + mBounds.getYMin() + " ymax: " + mBounds.getYMax() );
				
				int ascent = (mFont.getAscent() * mSize) / 1024;
				int descent = Math.abs( (mFont.getDescent() * mSize) / 1024 );
				int leading = (mFont.getLeading() * mSize) / 1024;

				// *** hack until Generator bug is fixed.
				if( System.getProperty("os.name") == "Mac OS" )
					leading = descent;
				
				//mEnv.logError( "Ascent: " + ascent + " Descent: " + descent + " Leading: " + leading );
				
				int fontHeight = ascent + descent;

				int containerWidth = containerBounds.getXMax() - containerBounds.getXMin();
				int containerHeight = containerBounds.getYMax() - containerBounds.getYMin();

				int textWidth = mBounds.getXMax() - mBounds.getXMin();
				int textHeight = mBounds.getYMax() - mBounds.getYMin();

				// horizontal alignment
				if( mAlignment == 0 || mAlignment >= 3)	// left, justified, default
				    mMatrix.setXOffset( - containerWidth / 2 );
				else if( mAlignment == 1 )	// right
				    mMatrix.setXOffset( containerWidth / 2 - textWidth );
				else if( mAlignment == 2 )	// center
				    mMatrix.setXOffset( - textWidth / 2 );
			
				// vertical alignment
				if( mVAlign == 0 )		// top
				    mMatrix.setYOffset( - containerHeight/2 /*- mBounds.getYMin()*/ );
				else if( mVAlign == 1 ) // bottom
				    mMatrix.setYOffset( containerHeight/2 - fontHeight /*mBounds.getYMax()*/ );
				else					// center, default
				    mMatrix.setYOffset( - ((ascent + descent + leading)/2) /* mBounds.getYMin() - textHeight/2*/);
			}

			// if the user specifed shrinkwrap to be true, the movie should be set to
			// be the same size as the text in this object.
			if (mShrinkwrap && mBounds != null)
			{
				// get the top level movie script
				Script topLevel = mEnv.getTemplate();

				// determine hte width and height of the text
				int width = mBounds.getXMax() - mBounds.getXMin() + BORDER_FUDGE * 2;
				int height = mBounds.getYMax() - mBounds.getYMin() + BORDER_FUDGE * 2;

				// set the movie to be the same size as the text
				topLevel.setWidth(width/20);
				topLevel.setHeight(height/20);

				// Adjust the object so that the top left of the bounding box lines
				// up with the top-left corner of the movie.
				mMatrix.setXOffset(-(mBounds.getXMin() - BORDER_FUDGE));
				mMatrix.setYOffset(-(mBounds.getYMin() - BORDER_FUDGE));
			}

			// draw the box if i should, for debugging
			if (mDrawBox)
			{
				Color c = new Color();
				c.setRGBValue("#ffaaaa");
				c.setAlpha(100);
				Shape box = createShape(mBounds, c);

				mTemplateScript.insertShape(box, mLayer, mStartFrame, mMatrix, mEndFrame, mMatrix);
			}

			// check to see if this is a text to be clicked on
			if ( (mRolloverColor != null) ||
			     ((mUrl != null) && (mUrl.length() > 0) && !mUrl.equalsIgnoreCase(DEFAULT_URL)) )
			{
				// this will create a button from the text, and add it to the script
				makeButton();
			}
			else  // otherwise, just add the text to the script
			{
				mTemplateScript.insertText(mText, mLayer, mStartFrame, mMatrix, mEndFrame, mMatrix);
			}
		}
		catch (GeneratorApiException e)
		{
			mEnv.logError("Exception: " + e);
		}
	}


/************************************************************************************/
/************************************************************************************/
/************************************************************************************/

	public void parseArguments(FlashEnvironment env, Context context, Properties props) throws GeneratorApiException
	{
		mString = getStringParamEmpty(context, props, PARAM_STRING);

		// make sure we have text, 'cause that's necessary
		if (mString == null)
		{
			env.logError("InsertText: text not specified.");
			
			throw new GeneratorApiException("missing text");
		}

		// determine the color of the text
		String colorName = getStringParam(context, props, PARAM_COLOR, DEFAULT_COLOR);
		mAlpha = getIntParam(context, props, "alpha", 255);
		mColor = new Color();
		try
		{
			mColor.setRGBValue(colorName);
			// mColor.setAlpha(mAlpha);
		}
		catch (GeneratorApiException ex)
		{
			env.logError("InsertText: could not find text color.");
			throw ex;
		}

		// determine the background color
		colorName = getStringParam(context, props, PARAM_BG_COLOR, DEFAULT_BG_COLOR);

		if (colorName.length() > 0 && !colorName.equalsIgnoreCase(DEFAULT_BG_COLOR))
		{
			mBGColor = new Color();
			try
			{
				mBGColor.setRGBValue(colorName);
			}
			catch (GeneratorApiException ex)
			{
				env.logError("InsertText: could not find background color.");
				throw ex;
			}
		}

		// determine the color for the text when rolled over
		colorName = getStringParam(context, props, PARAM_ROLLOVER_COLOR, DEFAULT_ROLLOVER_COLOR);

		if (colorName.length() > 0 && !colorName.equalsIgnoreCase(DEFAULT_ROLLOVER_COLOR))
		{
			mRolloverColor = new Color();
			try
			{
				mRolloverColor.setRGBValue(colorName);
			}
			catch (GeneratorApiException ex)
			{
				env.logError("InsertText: could not find rollover color.");
				throw ex;
			}
		}


		mBold = getBoolParam(context, props, PARAM_BOLD);
		mItalic = getBoolParam(context, props, PARAM_ITALIC);

		// determine what font was specified
		String fontName = getStringParam(context, props, PARAM_FONT, DEFAULT_FONT);
		mFont = new Font();

		try {
		    // If a truetype font file was specified, try loading that
		    if (fontName.endsWith(".ttf"))
			{
			    mFont.setFile(fontName);
			}
		    // If an FFT file was specified, try loading that.
		    else if (fontName.endsWith(".fft"))
			{
			    mFont.setFftFile(fontName);
			}
		    else
			{
			    // Set the font to a system font.
			    mFont.setFont(fontName, mBold, mItalic);
			}
		}
		catch (GeneratorApiException ex)
		    {
			env.logError("InsertText: could not find font: " + fontName);
			throw ex;
		}

		String align = getStringParam(context, props, PARAM_ALIGNMENT, DEFAULT_ALIGNMENT);

		try 
		    {
			// See if the alignment was specified as an integer.
			mAlignment = Integer.valueOf(align).intValue();
		    }
		catch (NumberFormatException e)
		    {
			// Otherwise, case on the string passed in.
			if (align.equalsIgnoreCase("left"))
			    mAlignment = 0;
			else if (align.equalsIgnoreCase("right"))
			    mAlignment = 1;
			else if (align.equalsIgnoreCase("center"))
			    mAlignment = 2;
			else if (align.equalsIgnoreCase("justified"))
			    mAlignment = 3;
			else {
			    String error = "InsertText: invalid alignment value: " + align;
			    mEnv.logError(error);
			    throw new GeneratorApiException(error);
			}
		    }

		String valign = getStringParam(context, props, PARAM_VALIGN, DEFAULT_VALIGN);

		try 
		{
			// See if the alignment was specified as an integer.
			mVAlign = Integer.valueOf(valign).intValue();
		}
		catch (NumberFormatException e)
		{
			// Otherwise, case on the string passed in.
			if (valign.equalsIgnoreCase("top"))
			    mVAlign = 0;
			else if (valign.equalsIgnoreCase("bottom"))
			    mVAlign = 1;
			else if (valign.equalsIgnoreCase("center"))
			    mVAlign = 2;
			else {
			    String error = "InsertText: invalid vertical alignment value: " + valign;
			    mEnv.logError(error);
			    throw new GeneratorApiException(error);
			}
		}

		mWindow = getStringParam(context, props, PARAM_WINDOW, DEFAULT_WINDOW);
		
		// there's no default for the url
		mUrl = getStringParamEmpty(context, props, PARAM_URL);

		mSize = getIntParam(context, props, PARAM_SIZE, DEFAULT_SIZE);
		mSpacing = getIntParam(context, props, PARAM_SPACING, DEFAULT_SPACING);
		mLineWidth = getIntParam(context, props, PARAM_LINE_WIDTH, DEFAULT_LINE_WIDTH);
		mIndent = getIntParam(context, props, PARAM_INDENT, DEFAULT_INDENT);
		mMarginLeft = getIntParam(context, props, PARAM_MARGIN_LEFT, DEFAULT_MARGIN_LEFT);
		mMarginRight = getIntParam(context, props, PARAM_MARGIN_RIGHT, DEFAULT_MARGIN_RIGHT);
		mLeading = getIntParam(context, props, PARAM_LEADING, DEFAULT_LEADING);
		mRotation = getIntParam(context, props, PARAM_ROTATION, DEFAULT_ROTATION);
		
		mOffset = getIntParam(context, props, PARAM_OFFSET, 0);

		mShrinkwrap = getBoolParam(context, props, PARAM_SHRINKWRAP);

		// Debugging
		mDrawBox = getBoolParam(context, props, "drawbox");
		if (getBoolParam(context, props, "nums"))
		{
			// initialize the string to the first character
			String modified = "" + Character.getNumericValue(mString.charAt(0));

			// loop through the string, turning the characters into numbers
			for (int i=1; i < mString.length(); i++)
			{
				modified = modified + "," + Character.getNumericValue(mString.charAt(i));
			}

			// set the string to the modified version
			mString = modified;
		}
	}


/************************************************************************************/
/************************************************************************************/
/************************************************************************************/

	public Text createText(Color color) throws GeneratorApiException
	{
		Text text = new Text();

		try
		{
			// Set all the basic properties of the text
			if (mSpacing >= 0)
				text.setSpacing(mSpacing);
			if (mLineWidth > 0)
				text.setLineWidth(mLineWidth);
			if (mAlignment >= 0 && mAlignment < 4)
				text.setAlignment(mAlignment);
			if (mIndent >= 0)
				text.setIndent(mIndent);
			if (mMarginLeft >= 0)
				text.setLeftMargin(mMarginLeft);
			if (mMarginRight >= 0)
				text.setRightMargin(mMarginRight);
			if (mLeading >= 0)
				text.setLeading(mLeading);
			if (mSize > 0) 
				text.setSize(mSize);

			text.setCenter(mOffset, mOffset);

			text.setFont(mFont);
			text.setColor(color);

			// Finally, set the string contents of the text.
			text.setString(mString);
		}
		catch (GeneratorApiException ex)
		{
			mEnv.logError("InsertText: could not create the text.");
			throw ex;
		}

		return text;
	}

/************************************************************************************/
/************************************************************************************/
/************************************************************************************/

	public void makeButton() throws GeneratorApiException
	{
		try
		{
			Button button = new Button();

			// create a temporary, default matrix
			Matrix tempMatrix = new Matrix();

			// specify which button state this text will work for (the up state)
			int buttonState = Button.buttonStateUp;

			// add the text to the button
			button.addText(mText, tempMatrix, buttonState, 0);

			// specify the text to be used for the other states
			buttonState = Button.buttonStateOver | Button.buttonStateDown;

			Text rolloverText;

			// use a different text only if there's a different rollover color
			if (mRolloverColor != null)
			{
				// use the same text as normal, except for the color
				rolloverText = createText(mRolloverColor);
			}
			else
			{
				// otherwise, just use the regular text
				rolloverText = mText;
			}

			// set the text for the rollover states
			button.addText(rolloverText, tempMatrix, buttonState, 0);

			// create a box defining the hit area as the bounds of the text
			Shape hitArea = createShape(mBounds, "black");

			// set this shape as the hit area for the button
			button.addShape(hitArea, tempMatrix, Button.buttonStateTest, 0);

			// if the url is defined
			if ( (mUrl != null) && (mUrl.length() > 0) && !mUrl.equalsIgnoreCase(DEFAULT_URL) )
			{
				// create an action
				Action action = new Action();

				// specify the action should be "go to said url"
				action.addGetURL(mUrl, mWindow);

				// specify that the action should occur when the button is pressed
				action.setTransitionState(Action.bsOverDownToOverUp);

				// add the action to the button
				button.addAction(action);
			}

			// tell the script about the button
			mTemplateScript.insertButton(button, mLayer, mStartFrame, mMatrix, mEndFrame, mMatrix);

		}
		catch (GeneratorApiException ex)
		{
			mEnv.logError("InsertText: could not create a button");
			throw ex;
		}
	}

/************************************************************************************/
/************************************************************************************/
/************************************************************************************/

	private Shape createShape(Rect boundingBox, String colorString)
	{
		Shape shapeObj = null;

		try
		{
			Color color = new Color();
			color.setRGBValue(colorString);

			shapeObj = createShape(boundingBox, color);
		}
		catch (Exception e)
		{
			mEnv.logError(" An exception occured at:  " + e.getClass() + "  with message: " + e.getMessage());
		}

		return shapeObj;
	}

/************************************************************************************/
/************************************************************************************/
/************************************************************************************/

	private Shape createShape(Rect boundingBox, Color color)
	{
		Shape shapeObj = null;

		int xMin = boundingBox.getXMin();
		int xMax = boundingBox.getXMax();
		int yMin = boundingBox.getYMin();
		int yMax = boundingBox.getYMax();

		try
		{

			/* In order to specify a FillStyle color using the 
			 * setFillStyle method, you must first must create 2 
			 * instances of FillStyle class. 
			 */
			FillStyle fill_1 = new FillStyle();
			fill_1.setColor( color );
			FillStyle fill_2 = new FillStyle();
			fill_2.setColor( color );


			/* Create a shape */
			shapeObj = new Shape();

			// Set the fill style of the shape.
			shapeObj.setFillStyle(fill_1, fill_2);

			// Draw the shape, according to the bounding box.
			shapeObj.moveTo(xMin, yMin);
			shapeObj.lineTo(xMax, yMin);
			shapeObj.lineTo(xMax, yMax);
			shapeObj.lineTo(xMin, yMax);
			shapeObj.lineTo(xMin, yMin);
		}				
 
		catch (Exception e)
		{
			/* Catch an exception and display the name of the exception
			 * in the Generator Output window if there are any errors.  
			 * The exception may not throw a detailed message.
			 */
			mEnv.logError(" An exception occured at:  " + e.getClass() + "  with message: " + e.getMessage());
		}
		
		return shapeObj;
	}

}


